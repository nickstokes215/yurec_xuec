package ru.yurec.xuec;

import android.Manifest;
import android.app.Activity;
import android.app.ActivityManager;
import android.content.ComponentName;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.provider.MediaStore;
import android.provider.Settings;
import android.util.DisplayMetrics;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.widget.Toast;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import androidx.core.content.FileProvider;
import androidx.core.content.pm.ShortcutInfoCompat;
import androidx.core.content.pm.ShortcutManagerCompat;
import androidx.core.graphics.drawable.IconCompat;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class YurecOffline {
    private static final String PROVIDER = "ru.yurec.xuec.files";
    public static final int REQ_STORAGE = 4302;
    private static final String BACKUP_NAME = "Жизнь Юрца.json";
    private static final String CHAT_LOG_NAME = "Юрец AI.txt";
    private final Context ctx;
    private final WebView web;
    private final Handler ui = new Handler(Looper.getMainLooper());
    private final ExecutorService pool = Executors.newSingleThreadExecutor();
    private final Set<String> cancel = ConcurrentHashMap.newKeySet();
    private final Map<String, Integer> prog = new HashMap<>();
    private String busy = "";
    private volatile boolean dead;
    private volatile String pendingBackupJson;
    private volatile String pendingChatText;

    public YurecOffline(Context ctx, WebView web) {
        this.ctx = ctx.getApplicationContext() != null ? ctx.getApplicationContext() : ctx;
        this.web = web;
    }

    public void shutdown() {
        dead = true;
        pool.shutdownNow();
    }

    public WebResourceResponse serve(Uri uri, WebResourceRequest request) {
        if (uri == null) return null;
        String path = uri.getPath();
        if (path == null || path.indexOf("/offline/") < 0) return null;
        int i = path.lastIndexOf('/');
        if (i < 0 || i >= path.length() - 1) return null;
        String name = path.substring(i + 1);
        File f = fileOfName(name);
        if (f == null || !f.isFile()) return null;
        String mime = name.endsWith(".mp3") ? "audio/mpeg" : "video/mp4";
        try {
            return new WebResourceResponse(mime, null, new FileInputStream(f));
        } catch (Exception e) {
            return null;
        }
    }

    @JavascriptInterface
    public void download(final String json) {
        pool.execute(new Runnable() {
            @Override
            public void run() {
                String id = "";
                try {
                    JSONObject o = new JSONObject(json);
                    id = o.optString("id", "");
                    String publicUrl = o.optString("url", "");
                    long wantSize = o.optLong("size", 0);
                    String wantSha = o.optString("sha256", "");
                    String ext = o.optString("ext", "mp4");
                    if (!"mp3".equals(ext)) ext = "mp4";
                    if (id.length() == 0 || publicUrl.length() == 0) throw new RuntimeException("empty");
                    busy = id;
                    cancel.remove(id);
                    emit(id, "downloading", 0, "");
                    String href = yandexHref(publicUrl);
                    if (href == null || href.length() == 0) throw new RuntimeException("Яндекс не отдал ссылку");
                    File dir = offlineDir();
                    if (!dir.exists()) dir.mkdirs();
                    File tmp = new File(dir, id + ".part");
                    File dest = new File(dir, id + "." + ext);
                    HttpURLConnection c = (HttpURLConnection) new URL(href).openConnection();
                    c.setInstanceFollowRedirects(true);
                    c.setConnectTimeout(20000);
                    c.setReadTimeout(20000);
                    c.setRequestProperty("User-Agent", "YurecOffline/1.50");
                    int code = c.getResponseCode();
                    if (code < 200 || code >= 300) throw new RuntimeException("Скачивание: HTTP " + code);
                    long total = c.getContentLength();
                    if (total <= 0) total = wantSize;
                    InputStream in = new BoundedInputStream(new BufferedInputStream(c.getInputStream()), wantSize > 0 ? wantSize + 1024 * 1024 : 0);
                    FileOutputStream out = new FileOutputStream(tmp);
                    MessageDigest md = MessageDigest.getInstance("SHA-256");
                    byte[] buf = new byte[16384];
                    long got = 0;
                    int n;
                    int lastPct = -1;
                    try {
                        while ((n = in.read(buf)) > 0) {
                            if (dead || cancel.contains(id)) throw new RuntimeException("cancel");
                            out.write(buf, 0, n);
                            md.update(buf, 0, n);
                            got += n;
                            if (total > 0) {
                                int pct = (int) Math.min(99, (got * 100) / total);
                                if (pct != lastPct) {
                                    lastPct = pct;
                                    emit(id, "downloading", pct, "");
                                }
                            }
                        }
                    } finally {
                        try { in.close(); } catch (Exception ignored) {}
                        try { out.close(); } catch (Exception ignored) {}
                        c.disconnect();
                    }
                    if (wantSize > 0 && got != wantSize) throw new RuntimeException("Размер не сошёлся");
                    String hex = hexOf(md.digest());
                    if (wantSha.length() > 0 && !wantSha.equalsIgnoreCase(hex)) {
                        throw new RuntimeException("SHA256 не сошёлся");
                    }
                    if (dest.exists()) dest.delete();
                    if (!tmp.renameTo(dest)) throw new RuntimeException("Не записал файл");
                    emit(id, "cached", 100, "");
                } catch (Exception e) {
                    String msg = e.getMessage() == null ? "ошибка" : e.getMessage();
                    if ("cancel".equals(msg)) emit(id, "idle", 0, "");
                    else emit(id, "error", 0, msg);
                    try {
                        File part = new File(offlineDir(), id + ".part");
                        if (part.exists()) part.delete();
                    } catch (Exception ignored) {}
                } finally {
                    if (id.equals(busy)) busy = "";
                }
            }
        });
    }

    @JavascriptInterface
    public void cancel(String id) {
        if (id != null) cancel.add(id);
    }

    @JavascriptInterface
    public void remove(String id) {
        if (id == null) return;
        File dir = offlineDir();
        new File(dir, id + ".mp4").delete();
        new File(dir, id + ".mp3").delete();
        new File(dir, id + ".part").delete();
        emit(id, "idle", 0, "");
    }

    @JavascriptInterface
    public String cachedJson() {
        JSONArray a = new JSONArray();
        File dir = offlineDir();
        File[] files = dir.listFiles();
        if (files != null) {
            for (int i = 0; i < files.length; i++) {
                String n = files[i].getName();
                if (n.endsWith(".mp4") || n.endsWith(".mp3")) {
                    a.put(n.substring(0, n.lastIndexOf('.')));
                }
            }
        }
        return a.toString();
    }

    @JavascriptInterface
    public String playUrl(String id) {
        File f = fileOf(id);
        if (f == null) return "";
        String ext = f.getName().endsWith(".mp3") ? "mp3" : "mp4";
        return "https://appassets.androidplatform.net/offline/" + id + "." + ext;
    }

    @JavascriptInterface
    public void playExternal(String id) {
        final File f = fileOf(id);
        if (f == null) return;
        ui.post(new Runnable() {
            @Override
            public void run() {
                try {
                    Uri uri = FileProvider.getUriForFile(ctx, PROVIDER, f);
                    Intent i = new Intent(Intent.ACTION_VIEW);
                    i.setDataAndType(uri, f.getName().endsWith(".mp3") ? "audio/mpeg" : "video/mp4");
                    i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
                    ctx.startActivity(i);
                } catch (Exception ignored) {
                }
            }
        });
    }

    @JavascriptInterface
    public void setKeepScreenOn(final boolean on) {
        ui.post(new Runnable() {
            @Override
            public void run() {
                Context c = web.getContext();
                if (!(c instanceof android.app.Activity)) return;
                android.view.Window w = ((android.app.Activity) c).getWindow();
                if (w == null) return;
                if (on) w.addFlags(android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                else w.clearFlags(android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            }
        });
    }

    @JavascriptInterface
    public void setAppIcon(String id) {
        setLauncher(id, "short");
    }

    @JavascriptInterface
    public void setLauncher(final String icon, final String name) {
        ui.post(new Runnable() {
            @Override
            public void run() {
                try {
                    String ic = "horror".equals(icon) ? "horror" : "comedy";
                    String nm = "saga".equals(name) ? "saga" : ("arthouse".equals(name) ? "arthouse" : "short");
                    String want;
                    if ("horror".equals(ic)) {
                        want = "arthouse".equals(nm) ? "AliasHorrorArthouse" : ("saga".equals(nm) ? "AliasHorrorSaga" : "AliasHorror");
                    } else {
                        want = "arthouse".equals(nm) ? "AliasComedyArthouse" : ("saga".equals(nm) ? "AliasComedySaga" : "AliasComedy");
                    }
                    String[] all = {
                        "AliasComedy", "AliasComedySaga", "AliasComedyArthouse",
                        "AliasHorror", "AliasHorrorSaga", "AliasHorrorArthouse"
                    };
                    PackageManager pm = ctx.getPackageManager();
                    String pkg = ctx.getPackageName();
                    for (int i = 0; i < all.length; i++) {
                        ComponentName cn = new ComponentName(pkg, "ru.yurec.xuec." + all[i]);
                        int state = all[i].equals(want)
                                ? PackageManager.COMPONENT_ENABLED_STATE_ENABLED
                                : PackageManager.COMPONENT_ENABLED_STATE_DISABLED;
                        pm.setComponentEnabledSetting(cn, state, PackageManager.DONT_KILL_APP);
                    }
                } catch (Exception ignored) {
                }
            }
        });
    }

    @JavascriptInterface
    public void openDial(final String number) {
        ui.post(new Runnable() {
            @Override
            public void run() {
                try {
                    Intent i = new Intent(Intent.ACTION_DIAL, Uri.parse("tel:" + number));
                    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    ctx.startActivity(i);
                } catch (Exception ignored) {
                }
            }
        });
    }

    @JavascriptInterface
    public void openMail(final String to, final String subject, final String body) {
        ui.post(new Runnable() {
            @Override
            public void run() {
                try {
                    Intent i = new Intent(Intent.ACTION_SEND);
                    i.setType("message/rfc822");
                    i.putExtra(Intent.EXTRA_EMAIL, new String[]{ to });
                    i.putExtra(Intent.EXTRA_SUBJECT, subject);
                    i.putExtra(Intent.EXTRA_TEXT, body);
                    Intent chooser = Intent.createChooser(i, "На почту");
                    chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    ctx.startActivity(chooser);
                } catch (Exception ignored) {
                }
            }
        });
    }

    @JavascriptInterface
    public String deviceInfo() {
        StringBuilder sb = new StringBuilder();
        sb.append("Устройство: ").append(Build.MANUFACTURER).append(" ").append(Build.MODEL).append("\n");
        sb.append("Сборка: ").append(Build.DISPLAY).append("\n");
        sb.append("Ядро: Android ").append(Build.VERSION.RELEASE).append(" / ").append(Build.VERSION.SDK_INT).append("\n");
        try {
            PackageInfo pi = ctx.getPackageManager().getPackageInfo(ctx.getPackageName(), 0);
            sb.append("Пакет: ").append(pi.packageName).append(" ").append(pi.versionName).append("\n");
        } catch (Exception ignored) {
        }
        sb.append("Локаль: ").append(Locale.getDefault().toString()).append("\n");
        try {
            DisplayMetrics dm = ctx.getResources().getDisplayMetrics();
            sb.append("Экран: ").append(dm.widthPixels).append("×").append(dm.heightPixels).append(" @").append((int) dm.densityDpi).append("\n");
        } catch (Exception ignored) {
        }
        try {
            ActivityManager.MemoryInfo mi = new ActivityManager.MemoryInfo();
            ((ActivityManager) ctx.getSystemService(Context.ACTIVITY_SERVICE)).getMemoryInfo(mi);
            sb.append(Math.round(mi.availMem / 1048576f)).append(" МБ свободно\n");
        } catch (Exception ignored) {
        }
        return sb.toString();
    }

    @JavascriptInterface
    @SuppressWarnings("deprecation")
    public void buzz(String spec) {
        try {
            Vibrator v = (Vibrator) ctx.getSystemService(Context.VIBRATOR_SERVICE);
            if (v == null) return;
            long[] pat;
            if (spec == null || spec.length() == 0) {
                pat = new long[]{0, 40};
            } else if (spec.indexOf(',') < 0) {
                long ms = Long.parseLong(spec.trim());
                pat = new long[]{0, Math.max(10, Math.min(400, ms))};
            } else {
                String[] p = spec.split(",");
                pat = new long[p.length];
                for (int i = 0; i < p.length; i++) {
                    try { pat[i] = Long.parseLong(p[i].trim()); } catch (Exception e) { pat[i] = 20; }
                }
            }
            if (Build.VERSION.SDK_INT >= 26) {
                v.vibrate(VibrationEffect.createWaveform(pat, -1));
            } else {
                v.vibrate(pat, -1);
            }
        } catch (Exception ignored) {
        }
    }

    @JavascriptInterface
    public String saveBackup(final String name, final String json) {
        pendingBackupJson = json == null ? "" : json;
        String r = writeBackupNow();
        if ("ok".equals(r)) {
            pendingBackupJson = null;
            ui.post(new Runnable() {
                @Override
                public void run() {
                    Toast.makeText(ctx, "Справка: /sdcard/Backup/Жизнь Юрца.json", Toast.LENGTH_LONG).show();
                }
            });
            return "ok";
        }
        ui.post(new Runnable() {
            @Override
            public void run() {
                if (requestStorageIfNeeded()) return;
                writeBackupFile();
            }
        });
        return "need";
    }

    @JavascriptInterface
    public String appendChatLog(final String text) {
        pendingChatText = text == null ? "" : text;
        String r = writeChatLogNow();
        if ("ok".equals(r)) {
            pendingChatText = null;
            ui.post(new Runnable() {
                @Override
                public void run() {
                    Toast.makeText(ctx, "Чат: /sdcard/Backup/Юрец AI.txt", Toast.LENGTH_LONG).show();
                }
            });
            return "ok";
        }
        ui.post(new Runnable() {
            @Override
            public void run() {
                if (requestStorageIfNeeded()) return;
                writeChatLogFile();
            }
        });
        return "need";
    }

    public void flushBackup() {
        if (pendingBackupJson != null) {
            ui.post(new Runnable() {
                @Override
                public void run() {
                    if (pendingBackupJson == null) return;
                    if (requestStorageIfNeeded()) return;
                    writeBackupFile();
                }
            });
        }
        if (pendingChatText != null) {
            ui.post(new Runnable() {
                @Override
                public void run() {
                    if (pendingChatText == null) return;
                    if (requestStorageIfNeeded()) return;
                    writeChatLogFile();
                }
            });
        }
    }

    private boolean canWritePublic() {
        if (Build.VERSION.SDK_INT >= 30) {
            return Environment.isExternalStorageManager();
        }
        if (Build.VERSION.SDK_INT >= 23) {
            return ctx.checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE)
                    == PackageManager.PERMISSION_GRANTED;
        }
        return true;
    }

    private boolean requestStorageIfNeeded() {
        if (canWritePublic()) return false;
        if (Build.VERSION.SDK_INT >= 30) {
            try {
                Intent i = new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION);
                i.setData(Uri.parse("package:" + ctx.getPackageName()));
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                ctx.startActivity(i);
            } catch (Exception e) {
                try {
                    Intent i = new Intent(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION);
                    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    ctx.startActivity(i);
                } catch (Exception ignored) {
                }
            }
            Toast.makeText(ctx, "Разреши доступ ко всем файлам — и нажми экспорт ещё раз", Toast.LENGTH_LONG).show();
            return true;
        }
        Context host = web.getContext();
        if (host instanceof Activity && Build.VERSION.SDK_INT >= 23) {
            ((Activity) host).requestPermissions(
                    new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE},
                    REQ_STORAGE);
            return true;
        }
        return false;
    }

    private void writeBackupFile() {
        pool.execute(new Runnable() {
            @Override
            public void run() {
                String r = writeBackupNow();
                if ("ok".equals(r)) {
                    pendingBackupJson = null;
                    ui.post(new Runnable() {
                        @Override
                        public void run() {
                            Toast.makeText(ctx, "Справка: /sdcard/Backup/Жизнь Юрца.json", Toast.LENGTH_LONG).show();
                        }
                    });
                    return;
                }
                ui.post(new Runnable() {
                    @Override
                    public void run() {
                        Toast.makeText(ctx, "Не удалось сохранить справку", Toast.LENGTH_SHORT).show();
                    }
                });
            }
        });
    }

    private String writeBackupNow() {
        final String json = pendingBackupJson;
        if (json == null) return "fail";
        byte[] bytes = json.getBytes(java.nio.charset.Charset.forName("UTF-8"));
        File[] dirs = new File[] {
            new File(Environment.getExternalStorageDirectory(), "Backup"),
            new File("/sdcard/Backup"),
            new File("/storage/emulated/0/Backup")
        };
        for (int i = 0; i < dirs.length; i++) {
            File dir = dirs[i];
            try {
                if (!dir.exists() && !dir.mkdirs()) continue;
                File f = new File(dir, BACKUP_NAME);
                FileOutputStream out = new FileOutputStream(f);
                try {
                    out.write(bytes);
                } finally {
                    out.close();
                }
                return "ok";
            } catch (Exception ignored) {
            }
        }
        if (Build.VERSION.SDK_INT >= 29) {
            try {
                ContentValues values = new ContentValues();
                values.put(MediaStore.MediaColumns.DISPLAY_NAME, BACKUP_NAME);
                values.put(MediaStore.MediaColumns.MIME_TYPE, "application/json");
                values.put(MediaStore.MediaColumns.RELATIVE_PATH, "Backup/");
                Uri uri = ctx.getContentResolver().insert(
                        MediaStore.Files.getContentUri("external"), values);
                if (uri != null) {
                    java.io.OutputStream out = ctx.getContentResolver().openOutputStream(uri);
                    if (out != null) {
                        try {
                            out.write(bytes);
                        } finally {
                            out.close();
                        }
                        return "ok";
                    }
                }
            } catch (Exception ignored) {
            }
        }
        return "fail";
    }

    private void writeChatLogFile() {
        pool.execute(new Runnable() {
            @Override
            public void run() {
                String r = writeChatLogNow();
                if ("ok".equals(r)) {
                    pendingChatText = null;
                    ui.post(new Runnable() {
                        @Override
                        public void run() {
                            Toast.makeText(ctx, "Чат: /sdcard/Backup/Юрец AI.txt", Toast.LENGTH_LONG).show();
                        }
                    });
                    return;
                }
                ui.post(new Runnable() {
                    @Override
                    public void run() {
                        Toast.makeText(ctx, "Не удалось сохранить чат", Toast.LENGTH_SHORT).show();
                    }
                });
            }
        });
    }

    private String writeChatLogNow() {
        final String text = pendingChatText;
        if (text == null) return "fail";
        String stamp = new java.text.SimpleDateFormat("dd.MM.yyyy HH:mm", Locale.getDefault())
                .format(new java.util.Date());
        byte[] chunk;
        try {
            chunk = ("——— " + stamp + " ———\n\n" + text + "\n").getBytes("UTF-8");
        } catch (Exception e) {
            return "fail";
        }
        File[] dirs = new File[] {
            new File(Environment.getExternalStorageDirectory(), "Backup"),
            new File("/sdcard/Backup"),
            new File("/storage/emulated/0/Backup")
        };
        for (int i = 0; i < dirs.length; i++) {
            File dir = dirs[i];
            try {
                if (!dir.exists() && !dir.mkdirs()) continue;
                File f = new File(dir, CHAT_LOG_NAME);
                boolean exists = f.exists() && f.length() > 0;
                FileOutputStream out = new FileOutputStream(f, true);
                try {
                    if (exists) out.write("\n\n".getBytes("UTF-8"));
                    out.write(chunk);
                } finally {
                    out.close();
                }
                return "ok";
            } catch (Exception ignored) {
            }
        }
        if (Build.VERSION.SDK_INT >= 29) {
            try {
                android.content.ContentResolver cr = ctx.getContentResolver();
                android.database.Cursor cur = cr.query(
                        MediaStore.Files.getContentUri("external"),
                        new String[]{ MediaStore.MediaColumns._ID },
                        MediaStore.MediaColumns.DISPLAY_NAME + "=?",
                        new String[]{ CHAT_LOG_NAME },
                        null);
                Uri uri = null;
                if (cur != null) {
                    try {
                        if (cur.moveToFirst()) {
                            long id = cur.getLong(0);
                            uri = Uri.withAppendedPath(MediaStore.Files.getContentUri("external"), String.valueOf(id));
                        }
                    } finally {
                        cur.close();
                    }
                }
                if (uri == null) {
                    ContentValues values = new ContentValues();
                    values.put(MediaStore.MediaColumns.DISPLAY_NAME, CHAT_LOG_NAME);
                    values.put(MediaStore.MediaColumns.MIME_TYPE, "text/plain");
                    values.put(MediaStore.MediaColumns.RELATIVE_PATH, "Backup/");
                    uri = cr.insert(MediaStore.Files.getContentUri("external"), values);
                }
                if (uri != null) {
                    java.io.OutputStream out = cr.openOutputStream(uri, "wa");
                    if (out == null) out = cr.openOutputStream(uri);
                    if (out != null) {
                        try {
                            out.write("\n\n".getBytes("UTF-8"));
                            out.write(chunk);
                        } finally {
                            out.close();
                        }
                        return "ok";
                    }
                }
            } catch (Exception ignored) {
            }
        }
        return "fail";
    }

    @JavascriptInterface
    public String pinChatShortcut() {
        try {
            if (!ShortcutManagerCompat.isRequestPinShortcutSupported(ctx)) {
                ui.post(new Runnable() {
                    @Override
                    public void run() {
                        Toast.makeText(ctx, "Система не даёт ярлыки", Toast.LENGTH_SHORT).show();
                    }
                });
                return "need";
            }
            Intent intent = new Intent(ctx, MainActivity.class);
            intent.setAction("ru.yurec.xuec.CHAT");
            intent.putExtra("open", "chat");
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            IconCompat icon = chatShortcutIcon();
            ShortcutInfoCompat info = new ShortcutInfoCompat.Builder(ctx, "yurec-ai-chat")
                    .setShortLabel("Юрец AI")
                    .setLongLabel("Юрец AI")
                    .setIcon(icon)
                    .setIntent(intent)
                    .build();
            boolean ok = ShortcutManagerCompat.requestPinShortcut(ctx, info, null);
            return ok ? "ok" : "need";
        } catch (Exception e) {
            return "need";
        }
    }

    @JavascriptInterface
    public String pinQuoteWidget() {
        return QuoteWidget.pin(ctx);
    }

    @JavascriptInterface
    public void setWidgetInterval(int hours) {
        QuoteWidget.setHours(ctx, hours);
    }

    @JavascriptInterface
    public int getWidgetInterval() {
        return QuoteWidget.hours(ctx);
    }

    private IconCompat chatShortcutIcon() {
        try {
            InputStream in = ctx.getAssets().open("www/covers/chat.jpg");
            Bitmap bmp = BitmapFactory.decodeStream(in);
            try { in.close(); } catch (Exception ignored) {}
            if (bmp != null) return IconCompat.createWithBitmap(bmp);
        } catch (Exception ignored) {
        }
        int id = ctx.getResources().getIdentifier("ic_launcher_comedy", "mipmap", ctx.getPackageName());
        if (id != 0) return IconCompat.createWithResource(ctx, id);
        return IconCompat.createWithResource(ctx, android.R.drawable.ic_dialog_info);
    }

    private File offlineDir() {
        return new File(ctx.getFilesDir(), "offline");
    }

    private File fileOf(String id) {
        if (id == null || id.length() == 0) return null;
        File mp4 = new File(offlineDir(), id + ".mp4");
        if (mp4.isFile()) return mp4;
        File mp3 = new File(offlineDir(), id + ".mp3");
        if (mp3.isFile()) return mp3;
        return null;
    }

    private File fileOfName(String name) {
        if (name == null || name.indexOf("..") >= 0) return null;
        File f = new File(offlineDir(), name);
        return f.isFile() ? f : null;
    }

    private String yandexHref(String publicUrl) throws Exception {
        String api = "https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key="
                + java.net.URLEncoder.encode(publicUrl, "UTF-8");
        HttpURLConnection c = (HttpURLConnection) new URL(api).openConnection();
        c.setConnectTimeout(15000);
        c.setReadTimeout(15000);
        c.setRequestProperty("User-Agent", "YurecOffline/1.50");
        InputStream in = c.getInputStream();
        byte[] buf = new byte[8192];
        StringBuilder sb = new StringBuilder();
        int n;
        try {
            while ((n = in.read(buf)) > 0) sb.append(new String(buf, 0, n, "UTF-8"));
        } finally {
            in.close();
            c.disconnect();
        }
        JSONObject o = new JSONObject(sb.toString());
        return o.optString("href", "");
    }

    private void emit(final String id, final String state, final int progress, final String error) {
        if (dead) return;
        ui.post(new Runnable() {
            @Override
            public void run() {
                try {
                    JSONObject o = new JSONObject();
                    o.put("id", id);
                    o.put("state", state);
                    o.put("progress", progress);
                    o.put("error", error == null ? "" : error);
                    web.evaluateJavascript(
                            "(function(){try{window.yurecOfflineEvent&&window.yurecOfflineEvent("
                                    + o.toString() + ");}catch(e){}})()",
                            null);
                } catch (Exception ignored) {
                }
            }
        });
    }

    private static String hexOf(byte[] d) {
        StringBuilder sb = new StringBuilder(d.length * 2);
        for (int i = 0; i < d.length; i++) sb.append(String.format(Locale.US, "%02x", d[i] & 0xff));
        return sb.toString();
    }

    static class BoundedInputStream extends InputStream {
        private final InputStream in;
        private long left;
        BoundedInputStream(InputStream in, long max) {
            this.in = in;
            this.left = max <= 0 ? Long.MAX_VALUE : max;
        }
        @Override public int read() throws java.io.IOException {
            if (left <= 0) return -1;
            int v = in.read();
            if (v >= 0) left--;
            return v;
        }
        @Override public int read(byte[] b, int off, int len) throws java.io.IOException {
            if (left <= 0) return -1;
            int n = in.read(b, off, (int) Math.min(len, left));
            if (n > 0) left -= n;
            return n;
        }
        @Override public void close() throws java.io.IOException { in.close(); }
    }
}
