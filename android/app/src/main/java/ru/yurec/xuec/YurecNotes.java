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

/** Два канала: обновление (когда вышла сборка) и один стук в сутки. */
public class YurecNotes {
    public static final int REQ_NOTES = 4402;
    private static final String PREF = "yurec-notes";
    private static final String CH_UPD = "yurec_updates";
    private static final String CH_DAY = "yurec_daily";
    private static final String ACTION_DAILY = "ru.yurec.xuec.NOTES_DAILY";
    private static final long DAY = 24L * 60L * 60L * 1000L;
    private static final String LATEST = "https://api.github.com/repos/nickstokes215/yurec_xuec/releases/latest";
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
        if (!canPost(ctx)) return "denied";
        ensureChannels(ctx);
        post(ctx, CH_UPD, 701, "Проверка: новая сборка",
                "Так выглядит канал обновлений. Это диагностика, не настоящий релиз.", "/apk");
        String[] day = LINES[0];
        String[] game = LINES[1];
        post(ctx, CH_DAY, 702, day[0], day[1], day[2]);
        post(ctx, CH_DAY, 703, game[0], game[1], game[2]);
        return "ok";
    }

    private static void arm(Context ctx) {
        ensureChannels(ctx);
        SharedPreferences p = prefs(ctx);
        long now = System.currentTimeMillis();
        long since = p.getLong("since", 0L);
        if (since == 0L) {
            p.edit().putLong("since", now).apply();
            schedule(ctx, now + DAY);
            return;
        }
        long last = p.getLong("last", 0L);
        long mark = Math.max(since, last);
        if (now - mark >= DAY) {
            postDaily(ctx);
            p.edit().putLong("last", now).apply();
            schedule(ctx, now + DAY);
            return;
        }
        schedule(ctx, mark + DAY);
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
                    String tag = latestTag();
                    if (tag == null || tag.length() == 0) return;
                    String mine = versionName(ctx);
                    if (cmpVer(tag, mine) <= 0) return;
                    SharedPreferences p = prefs(ctx);
                    if (tag.equals(p.getString("told", ""))) return;
                    post(ctx, CH_UPD, 720, "Новая сборка " + tag,
                            "Вышла свежая версия. Старая уже орёт из подвала.", "/apk");
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

    private static void schedule(Context ctx, long when) {
        try {
            AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;
            if (when < System.currentTimeMillis() + 60000L) when = System.currentTimeMillis() + DAY;
            PendingIntent pi = dailyIntent(ctx);
            am.cancel(pi);
            if (Build.VERSION.SDK_INT >= 23) {
                am.setAndAllowWhileIdle(AlarmManager.RTC, when, pi);
            } else {
                am.set(AlarmManager.RTC, when, pi);
            }
        } catch (Exception ignored) {
            try {
                AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
                if (am != null) am.set(AlarmManager.RTC, when, dailyIntent(ctx));
            } catch (Exception ignored2) {
            }
        }
    }

    private static PendingIntent dailyIntent(Context ctx) {
        Intent i = new Intent(ctx, Ping.class);
        i.setAction(ACTION_DAILY);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= 23) flags |= PendingIntent.FLAG_IMMUTABLE;
        return PendingIntent.getBroadcast(ctx, 81, i, flags);
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
        upd.setDescription("Новая сборка, когда она правда вышла.");
        nm.createNotificationChannel(upd);
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
        Intent open = new Intent(ctx, MainActivity.class);
        open.setAction("ru.yurec.xuec.NOTE");
        open.putExtra("open", "route");
        open.putExtra("route", safeRoute(route));
        open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
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
            if (intent == null || !ACTION_DAILY.equals(intent.getAction())) return;
            if (!canPost(ctx)) return;
            ensureChannels(ctx);
            postDaily(ctx);
            prefs(ctx).edit().putLong("last", System.currentTimeMillis()).apply();
            schedule(ctx, System.currentTimeMillis() + DAY);
        }
    }

    public static class Boot extends BroadcastReceiver {
        @Override
        public void onReceive(Context ctx, Intent intent) {
            if (intent == null) return;
            if (!Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) return;
            if (!canPost(ctx)) return;
            long last = prefs(ctx).getLong("last", 0L);
            long since = prefs(ctx).getLong("since", 0L);
            long mark = Math.max(last, since);
            long when = mark <= 0L ? System.currentTimeMillis() + DAY : mark + DAY;
            if (when < System.currentTimeMillis() + 60000L) when = System.currentTimeMillis() + 60000L;
            schedule(ctx, when);
        }
    }
}
