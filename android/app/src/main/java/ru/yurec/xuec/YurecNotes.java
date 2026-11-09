package ru.yurec.xuec;

import android.Manifest;
import android.app.Activity;
import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import org.json.JSONObject;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.lang.ref.WeakReference;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Calendar;

/** Три канала: двор раз в сутки, разработка и обновление с GitHub. */
public class YurecNotes {
    public static final int REQ_NOTES = 4402;
    private static final String PREF = "yurec-notes";
    private static final String CH_UPD = "yurec_updates";
    private static final String CH_DAY = "yurec_daily";
    private static final String CH_DEV = "yurec_dev";
    private static final String ACTION_DAILY = "ru.yurec.xuec.NOTES_DAILY";
    private static final String ACTION_DEV = "ru.yurec.xuec.NOTES_DEV";
    private static final String ACTION_UPD = "ru.yurec.xuec.NOTES_UPD";
    private static final long DAY = 24L * 60L * 60L * 1000L;
    private static final String LATEST = "https://api.github.com/repos/nickstokes215/yurec_xuec/releases/latest";
    private static final String GROK = "https://grok.com/c/bd6138f0-50b2-46ff-ad22-78e3151fb58f";
    private static WeakReference<Activity> host = new WeakReference<Activity>(null);

    private static final String[][] LINES = new String[][] {
        { "Кроссворд стынет", "В киоске пустая сетка. Карандаш на месте.", "/" },
        { "Помойкобол", "Бабка размялась. Один матч, и можно закрыть.", "/game/av" },
        { "Цитата дня", "Одна фраза на столе. Не скрин — зайди.", "/citats" },
        { "Алконоид", "Шарик уже на харе. Запыльни, когда будет время.", "/game/ark" },
        { "Шотман", "Двор на месте. Ты давно не заглядывал.", "/" },
        { "Киоск", "Кроссворд не решится сам. Пять минут.", "/game/crosswords" },
        { "Стена", "Мел лежит. Подъезд ждёт одну строку.", "/wall" },
        { "Юрца игра", "Одна тема. Пять вопросов. И всё.", "/game/svoya" },
        { "Недочитано", "Серия брошена на диване. Можно с того же места.", "/" },
        { "Квест", "На Шотмана есть ход, который ты ещё не делал.", "/game/quest" },
        { "Гоша", "Каркнул один раз. Это не спам, это стук.", "/" },
        { "Сборник", "Полка пылится. Открой любой рассказ.", "/" },
        { "Песня", "Один куплет. Соседи ещё спят, можно тихо.", "/" },
        { "Визит", "Порог трёшки. Второй раз Юрец уже налил.", "/" },
        { "Бонус", "Спецвыпуск лежит отдельно. Пять минут, и медаль ближе.", "/" },
        { "Партия", "Один розыгрыш в Помойкоболе. После гола можно закрыть.", "/game/av" }
    };

    public static void bind(Activity activity) {
        host = new WeakReference<Activity>(activity);
    }

    public static Activity activity() {
        return host.get();
    }

    public static void onLaunch(Activity activity) {
        bind(activity);
        ask(activity, false);
    }

    public static void onPermission(Activity activity, int code, int[] results) {
        if (code != REQ_NOTES || activity == null) return;
        if (results != null && results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED) {
            arm(activity);
            checkUpdate(activity);
        }
    }

    public static String ask(Activity activity, boolean again) {
        if (activity == null) return "fail";
        bind(activity);
        ensureChannels(activity);
        if (canPost(activity)) {
            arm(activity);
            checkUpdate(activity);
            return "ok";
        }
        if (Build.VERSION.SDK_INT < 33) {
            arm(activity);
            return "ok";
        }
        SharedPreferences p = prefs(activity);
        boolean asked = p.getBoolean("asked", false);
        if (again && asked && !activity.shouldShowRequestPermissionRationale(Manifest.permission.POST_NOTIFICATIONS)) {
            try {
                Intent i = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
                i.putExtra(Settings.EXTRA_APP_PACKAGE, activity.getPackageName());
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                activity.startActivity(i);
            } catch (Exception ignored) {
            }
            return "settings";
        }
        if (!asked || again) {
            p.edit().putBoolean("asked", true).apply();
            activity.requestPermissions(new String[] { Manifest.permission.POST_NOTIFICATIONS }, REQ_NOTES);
            return "ask";
        }
        return "later";
    }

    public static String test(Context ctx) {
        return testOne(ctx, "all");
    }

    public static String testOne(Context ctx, String kind) {
        if (ctx == null) return "fail";
        if (!canPost(ctx)) return "denied";
        ensureChannels(ctx);
        if (kind == null || kind.length() == 0) kind = "all";
        if ("all".equals(kind) || "upd".equals(kind)) {
            post(ctx, CH_UPD, 701, "Проверка: обновление",
                    "Так выглядит канал обновлений. Это диагностика, не настоящий релиз. Настоящий стук скажет, что сборку можно скачать с официального источника автора.",
                    "/apk");
        }
        if ("all".equals(kind) || "day".equals(kind)) {
            String[] day = LINES[0];
            post(ctx, CH_DAY, 702, day[0], day[1], day[2]);
        }
        if ("all".equals(kind) || "dev".equals(kind)) {
            post(ctx, CH_DEV, 703, "Проверка: разработка",
                    "Так выглядит канал разработки. Настоящий стук позовёт в Grok продолжить двор.",
                    GROK);
        }
        return "ok";
    }

    private static void arm(Context ctx) {
        ensureChannels(ctx);
        SharedPreferences p = prefs(ctx);
        long now = System.currentTimeMillis();
        if (p.getLong("since", 0L) == 0L) p.edit().putLong("since", now).apply();
        scheduleChan(ctx, "day", ACTION_DAILY, 81, false);
        scheduleChan(ctx, "dev", ACTION_DEV, 82, false);
        scheduleChan(ctx, "upd", ACTION_UPD, 83, false);
        if (chanOn(ctx, "upd", true)) checkUpdate(ctx);
    }

    /** Старый мост: минуты двора. Меньше нуля — стук через сутки, без своего часа. */
    public static String setClock(Context ctx, int minutes) {
        if (ctx == null) return "fail";
        if (minutes < 0 || minutes > 1439) {
            prefs(ctx).edit().putBoolean("day_on", true).putString("day_mode", "span").putInt("day_min", -1).putInt("clock", -1).apply();
        } else {
            prefs(ctx).edit().putBoolean("day_on", true).putString("day_mode", "clock").putInt("day_min", minutes).putInt("clock", minutes).apply();
        }
        if (canPost(ctx)) arm(ctx);
        return minutes < 0 ? "off" : "ok";
    }

    public static String setPlan(Context ctx, String json) {
        if (ctx == null) return "fail";
        try {
            if (json != null && json.length() > 0 && json.charAt(0) == '{') {
                JSONObject root = new JSONObject(json);
                applyChan(ctx, root, "day", true, "span", -1);
                applyChan(ctx, root, "dev", false, "clock", 480);
                applyChan(ctx, root, "upd", true, "clock", 480);
            }
        } catch (Exception ignored) {
        }
        if (canPost(ctx)) arm(ctx);
        return state(ctx);
    }

    public static String state(Context ctx) {
        try {
            JSONObject o = new JSONObject();
            o.put("day", chanJson(ctx, "day", true, "span", -1));
            o.put("dev", chanJson(ctx, "dev", false, "clock", 480));
            o.put("upd", chanJson(ctx, "upd", true, "clock", 480));
            return o.toString();
        } catch (Exception e) {
            return "{}";
        }
    }

    private static void applyChan(Context ctx, JSONObject root, String id, boolean defOn, String defMode, int defMin) {
        JSONObject o = root.optJSONObject(id);
        if (o == null) return;
        boolean on = o.optBoolean("on", defOn);
        String mode = o.optString("mode", defMode);
        if (!"span".equals(mode) && !"clock".equals(mode) && !"random".equals(mode)) mode = defMode;
        if (!"day".equals(id) && "span".equals(mode)) mode = "clock";
        int min = o.optInt("min", defMin);
        if (min < -1 || min > 1439) min = defMin;
        SharedPreferences.Editor ed = prefs(ctx).edit();
        ed.putBoolean(id + "_on", on);
        ed.putString(id + "_mode", mode);
        ed.putInt(id + "_min", min);
        if ("random".equals(mode) && min >= 0) ed.putInt(id + "_roll", min);
        if ("day".equals(id)) ed.putInt("clock", "span".equals(mode) ? -1 : min);
        ed.apply();
    }

    private static JSONObject chanJson(Context ctx, String id, boolean defOn, String defMode, int defMin) throws Exception {
        SharedPreferences p = prefs(ctx);
        JSONObject o = new JSONObject();
        if ("day".equals(id) && !p.contains("day_mode")) {
            int clock = p.getInt("clock", -1);
            o.put("on", true);
            if (clock >= 0 && clock <= 1439) {
                o.put("mode", "clock");
                o.put("min", clock);
            } else {
                o.put("mode", "span");
                o.put("min", -1);
            }
            return o;
        }
        String mode = p.getString(id + "_mode", defMode);
        int min = p.getInt(id + "_min", defMin);
        if ("random".equals(mode)) {
            int roll = p.getInt(id + "_roll", min);
            if (roll >= 0 && roll <= 1439) min = roll;
        }
        o.put("on", p.getBoolean(id + "_on", defOn));
        o.put("mode", mode);
        o.put("min", min);
        return o;
    }

    private static boolean chanOn(Context ctx, String id, boolean defOn) {
        SharedPreferences p = prefs(ctx);
        if ("day".equals(id) && !p.contains("day_on")) return true;
        return p.getBoolean(id + "_on", defOn);
    }

    private static long nextWhen(Context ctx, String id, boolean forceNextDay) {
        if (!chanOn(ctx, id, "dev".equals(id) ? false : true)) return 0L;
        SharedPreferences p = prefs(ctx);
        String mode = p.getString(id + "_mode", "day".equals(id) ? "span" : "clock");
        if ("day".equals(id) && !p.contains("day_mode")) mode = p.getInt("clock", -1) >= 0 ? "clock" : "span";
        long now = System.currentTimeMillis();
        if ("span".equals(mode)) {
            long last = p.getLong("last", 0L);
            long since = p.getLong("since", 0L);
            long mark = Math.max(last, since);
            long when = mark <= 0L ? now + DAY : mark + DAY;
            if (when < now + 60000L) when = now + DAY;
            return when;
        }
        int clock = p.getInt(id + "_min", 480);
        if ("random".equals(mode)) {
            int roll = p.getInt(id + "_roll", -1);
            if (roll < 0 || roll > 1439) {
                roll = (int) (Math.random() * 1440);
                p.edit().putInt(id + "_roll", roll).putInt(id + "_min", roll).apply();
            }
            clock = roll;
        }
        if (clock < 0 || clock > 1439) clock = 480;
        Calendar c = Calendar.getInstance();
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
        c.set(Calendar.HOUR_OF_DAY, clock / 60);
        c.set(Calendar.MINUTE, clock % 60);
        if (forceNextDay || c.getTimeInMillis() <= now + 60000L) c.add(Calendar.DAY_OF_YEAR, 1);
        return c.getTimeInMillis();
    }

    private static void reroll(Context ctx, String id) {
        SharedPreferences p = prefs(ctx);
        if (!"random".equals(p.getString(id + "_mode", ""))) return;
        int roll = (int) (Math.random() * 1440);
        p.edit().putInt(id + "_roll", roll).putInt(id + "_min", roll).apply();
    }

    private static void postDaily(Context ctx) {
        Calendar c = Calendar.getInstance();
        int idx = (int) ((c.get(Calendar.YEAR) * 366L + c.get(Calendar.DAY_OF_YEAR)) % LINES.length);
        if (idx < 0) idx = 0;
        String[] line = LINES[idx];
        post(ctx, CH_DAY, 710, line[0], line[1], line[2]);
    }

    private static void checkUpdate(final Context ctx) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    if (!canPost(ctx)) return;
                if (!chanOn(ctx, "upd", true)) return;
                    String tag = latestTag();
                    if (tag == null || tag.length() == 0) return;
                    String mine = versionName(ctx);
                    if (cmpVer(tag, mine) <= 0) return;
                    SharedPreferences p = prefs(ctx);
                    if (tag.equals(p.getString("told", ""))) return;
                    post(ctx, CH_UPD, 720, "Обновление " + tag,
                            "Доступна новая сборка. Скачать можно с официального источника автора.", "/apk");
                    p.edit().putString("told", tag).apply();
                } catch (Exception ignored) {
                }
            }
        }, "yurec-notes").start();
    }

    private static String latestTag() throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(LATEST).openConnection();
        c.setRequestProperty("User-Agent", "yurec-xuec");
        c.setRequestProperty("Accept", "application/vnd.github+json");
        c.setConnectTimeout(8000);
        c.setReadTimeout(8000);
        InputStream in = c.getResponseCode() >= 400 ? c.getErrorStream() : c.getInputStream();
        if (in == null) return "";
        ByteArrayOutputStream buf = new ByteArrayOutputStream();
        byte[] tmp = new byte[2048];
        int n;
        while ((n = in.read(tmp)) >= 0) {
            buf.write(tmp, 0, n);
            if (buf.size() > 200000) break;
        }
        in.close();
        c.disconnect();
        String tag = new JSONObject(buf.toString("UTF-8")).optString("tag_name", "");
        tag = tag.replace("v", "").replace("V", "");
        String clean = "";
        for (int i = 0; i < tag.length() && clean.length() < 24; i++) {
            char ch = tag.charAt(i);
            if ((ch >= '0' && ch <= '9') || ch == '.') clean += ch;
        }
        return clean;
    }

    private static String versionName(Context ctx) {
        try {
            return ctx.getPackageManager().getPackageInfo(ctx.getPackageName(), 0).versionName;
        } catch (Exception e) {
            return "0";
        }
    }

    static int cmpVer(String a, String b) {
        String[] as = (a == null ? "" : a).split("\\.");
        String[] bs = (b == null ? "" : b).split("\\.");
        int n = Math.max(as.length, bs.length);
        for (int i = 0; i < n; i++) {
            int ai = i < as.length ? num(as[i]) : 0;
            int bi = i < bs.length ? num(bs[i]) : 0;
            if (ai != bi) return ai - bi;
        }
        return 0;
    }

    private static int num(String s) {
        int v = 0;
        if (s == null) return 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c < '0' || c > '9') break;
            v = v * 10 + (c - '0');
        }
        return v;
    }

    private static void scheduleChan(Context ctx, String id, String action, int req, boolean forceNextDay) {
        PendingIntent pi = pingIntent(ctx, action, req);
        try {
            AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;
            am.cancel(pi);
            long when = nextWhen(ctx, id, forceNextDay);
            if (when <= 0L) return;
            if (Build.VERSION.SDK_INT >= 23) am.setAndAllowWhileIdle(AlarmManager.RTC, when, pi);
            else am.set(AlarmManager.RTC, when, pi);
        } catch (Exception ignored) {
        }
    }

    private static PendingIntent pingIntent(Context ctx, String action, int req) {
        Intent i = new Intent(ctx, Ping.class);
        i.setAction(action);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= 23) flags |= PendingIntent.FLAG_IMMUTABLE;
        return PendingIntent.getBroadcast(ctx, req, i, flags);
    }

    private static void ensureChannels(Context ctx) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        NotificationChannel day = new NotificationChannel(CH_DAY, "Раз в сутки", NotificationManager.IMPORTANCE_DEFAULT);
        day.setDescription("Один стук: заглянуть в сборник или сыграть. Не чаще раза в день.");
        day.enableVibration(false);
        nm.createNotificationChannel(day);
        NotificationChannel upd = new NotificationChannel(CH_UPD, "Обновления", NotificationManager.IMPORTANCE_DEFAULT);
        upd.setDescription("Новая сборка на GitHub. Скачать можно с официального источника автора.");
        nm.createNotificationChannel(upd);
        NotificationChannel dev = new NotificationChannel(CH_DEV, "Разработка", NotificationManager.IMPORTANCE_DEFAULT);
        dev.setDescription("Напоминание зайти в Grok и продолжить двор. Свой час.");
        dev.enableVibration(false);
        nm.createNotificationChannel(dev);
    }

    private static boolean canPost(Context ctx) {
        if (Build.VERSION.SDK_INT < 33) return true;
        return ctx.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
    }

    private static int icon(Context ctx) {
        int id = ctx.getResources().getIdentifier("ic_launcher_comedy", "mipmap", ctx.getPackageName());
        return id != 0 ? id : android.R.drawable.ic_dialog_info;
    }

    private static void post(Context ctx, String channel, int id, String title, String text, String route) {
        try {
            NotificationCompat.Builder b = new NotificationCompat.Builder(ctx, channel)
                    .setSmallIcon(icon(ctx))
                    .setContentTitle(title)
                    .setContentText(text)
                    .setStyle(new NotificationCompat.BigTextStyle().bigText(text))
                    .setAutoCancel(true)
                    .setContentIntent(openIntent(ctx, route, id));
            NotificationManagerCompat.from(ctx).notify(id, b.build());
        } catch (Exception ignored) {
        }
    }

    private static PendingIntent openIntent(Context ctx, String route, int id) {
        Intent open;
        if (route != null && route.startsWith("https://grok.com")) {
            open = new Intent(Intent.ACTION_VIEW, Uri.parse(route));
        } else {
            open = new Intent(ctx, MainActivity.class);
            open.setAction("ru.yurec.xuec.NOTE");
            open.putExtra("open", "route");
            open.putExtra("route", safeRoute(route));
            open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        }
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= 23) flags |= PendingIntent.FLAG_IMMUTABLE;
        return PendingIntent.getActivity(ctx, 90 + id, open, flags);
    }

    static String safeRoute(String route) {
        if (route == null || route.length() == 0 || route.charAt(0) != '/') return "/";
        for (int i = 0; i < route.length(); i++) {
            char c = route.charAt(i);
            boolean ok = (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || c == '/' || c == '-' || c == '_';
            if (!ok) return "/";
        }
        return route;
    }

    private static SharedPreferences prefs(Context ctx) {
        return ctx.getSharedPreferences(PREF, Context.MODE_PRIVATE);
    }

    public static class Ping extends BroadcastReceiver {
        @Override
        public void onReceive(Context ctx, Intent intent) {
            if (intent == null || ctx == null) return;
            String action = intent.getAction();
            if (!canPost(ctx)) return;
            ensureChannels(ctx);
            if (ACTION_DAILY.equals(action)) {
                if (chanOn(ctx, "day", true)) {
                    postDaily(ctx);
                    prefs(ctx).edit().putLong("last", System.currentTimeMillis()).apply();
                }
                reroll(ctx, "day");
                scheduleChan(ctx, "day", ACTION_DAILY, 81, true);
            } else if (ACTION_DEV.equals(action)) {
                if (chanOn(ctx, "dev", false)) {
                    post(ctx, CH_DEV, 730, "Разработка",
                            "Лимит мог отпуститься. Зайди в Grok и продолжи работу над двором.", GROK);
                }
                reroll(ctx, "dev");
                scheduleChan(ctx, "dev", ACTION_DEV, 82, true);
            } else if (ACTION_UPD.equals(action)) {
                if (chanOn(ctx, "upd", true)) checkUpdate(ctx);
                reroll(ctx, "upd");
                scheduleChan(ctx, "upd", ACTION_UPD, 83, true);
            }
        }
    }

    public static class Boot extends BroadcastReceiver {
        @Override
        public void onReceive(Context ctx, Intent intent) {
            if (intent == null || ctx == null) return;
            if (!Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) return;
            if (!canPost(ctx)) return;
            ensureChannels(ctx);
            scheduleChan(ctx, "day", ACTION_DAILY, 81, false);
            scheduleChan(ctx, "dev", ACTION_DEV, 82, false);
            scheduleChan(ctx, "upd", ACTION_UPD, 83, false);
        }
    }
}
