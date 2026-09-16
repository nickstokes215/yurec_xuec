package ru.yurec.xuec;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.SystemClock;
import android.widget.RemoteViews;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class QuoteWidget extends AppWidgetProvider {
    public static final String ACTION_TICK = "ru.yurec.xuec.WIDGET_TICK";
    public static final String PREFS = "yurec_widget";
    public static final String KEY_HOURS = "hours";
    public static final String KEY_ID = "id";
    public static final String KEY_TEXT = "text";
    public static final String KEY_SPEAKER = "speaker";

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        for (int i = 0; i < ids.length; i++) bind(ctx, mgr, ids[i], false);
        schedule(ctx);
    }

    @Override
    public void onEnabled(Context ctx) {
        pickQuote(ctx, false);
        refreshAll(ctx, false);
        schedule(ctx);
    }

    @Override
    public void onDisabled(Context ctx) {
        cancel(ctx);
    }

    @Override
    public void onReceive(Context ctx, Intent intent) {
        super.onReceive(ctx, intent);
        if (intent == null) return;
        String act = intent.getAction();
        if (ACTION_TICK.equals(act)) {
            pickQuote(ctx, true);
            refreshAll(ctx, false);
            schedule(ctx);
        } else if (Intent.ACTION_BOOT_COMPLETED.equals(act)
                || Intent.ACTION_MY_PACKAGE_REPLACED.equals(act)) {
            refreshAll(ctx, false);
            schedule(ctx);
        }
    }

    public static int hours(Context ctx) {
        int h = prefs(ctx).getInt(KEY_HOURS, 24);
        if (h != 1 && h != 6 && h != 12 && h != 24) h = 24;
        return h;
    }

    public static void setHours(Context ctx, int h) {
        if (h != 1 && h != 6 && h != 12) h = 24;
        prefs(ctx).edit().putInt(KEY_HOURS, h).apply();
        pickQuote(ctx, true);
        refreshAll(ctx, false);
        schedule(ctx);
    }

    public static String pin(Context ctx) {
        if (Build.VERSION.SDK_INT < 26) return "old";
        try {
            AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
            if (mgr == null || !mgr.isRequestPinAppWidgetSupported()) return "need";
            ComponentName cn = new ComponentName(ctx, QuoteWidget.class);
            boolean ok = mgr.requestPinAppWidget(cn, null, null);
            return ok ? "ok" : "need";
        } catch (Exception e) {
            return "need";
        }
    }

    public static void refreshAll(Context ctx, boolean next) {
        if (next) pickQuote(ctx, true);
        AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
        int[] ids = mgr.getAppWidgetIds(new ComponentName(ctx, QuoteWidget.class));
        if (ids == null) return;
        for (int i = 0; i < ids.length; i++) bind(ctx, mgr, ids[i], false);
    }

    private static void bind(Context ctx, AppWidgetManager mgr, int id, boolean next) {
        if (next) pickQuote(ctx, true);
        SharedPreferences p = prefs(ctx);
        String text = p.getString(KEY_TEXT, "");
        String speaker = p.getString(KEY_SPEAKER, "");
        if (text == null || text.length() == 0) {
            pickQuote(ctx, false);
            text = p.getString(KEY_TEXT, "Бери лаваш и вали, психопат!");
            speaker = p.getString(KEY_SPEAKER, "Повар шавермы");
        }
        RemoteViews rv = new RemoteViews(ctx.getPackageName(), R.layout.widget_quote);
        rv.setTextViewText(R.id.widget_quote, "«" + text + "»");
        rv.setTextViewText(R.id.widget_speaker, speaker);
        Intent open = new Intent(ctx, MainActivity.class);
        open.setAction("ru.yurec.xuec.CITATS");
        open.putExtra("open", "citats");
        open.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= 23) flags |= PendingIntent.FLAG_IMMUTABLE;
        rv.setOnClickPendingIntent(R.id.widget_root, PendingIntent.getActivity(ctx, 71, open, flags));
        mgr.updateAppWidget(id, rv);
    }

    private static void pickQuote(Context ctx, boolean force) {
        SharedPreferences p = prefs(ctx);
        if (!force && p.getString(KEY_TEXT, "").length() > 0) return;
        List<String[]> all = loadCitats(ctx);
        if (all.isEmpty()) {
            p.edit().putString(KEY_ID, "c01")
                    .putString(KEY_TEXT, "Бери лаваш и вали, психопат!")
                    .putString(KEY_SPEAKER, "Повар шавермы")
                    .apply();
            return;
        }
        String last = p.getString(KEY_ID, "");
        List<String[]> pool = new ArrayList<>();
        for (int i = 0; i < all.size(); i++) {
            if (!all.get(i)[0].equals(last)) pool.add(all.get(i));
        }
        if (pool.isEmpty()) pool = all;
        String[] pick = pool.get(new Random().nextInt(pool.size()));
        p.edit().putString(KEY_ID, pick[0])
                .putString(KEY_TEXT, pick[1])
                .putString(KEY_SPEAKER, pick[2])
                .apply();
    }

    private static List<String[]> loadCitats(Context ctx) {
        List<String[]> out = new ArrayList<>();
        try {
            InputStream in = ctx.getAssets().open("www/citats.json");
            ByteArrayOutputStream buf = new ByteArrayOutputStream();
            byte[] tmp = new byte[4096];
            int n;
            while ((n = in.read(tmp)) > 0) buf.write(tmp, 0, n);
            in.close();
            JSONArray arr = new JSONArray(new String(buf.toByteArray(), Charset.forName("UTF-8")));
            for (int i = 0; i < arr.length(); i++) {
                JSONObject o = arr.getJSONObject(i);
                String id = o.optString("id", "c" + i);
                String text = o.optString("text", "");
                String speaker = o.optString("speaker", "Юрец");
                if (text.length() == 0) continue;
                out.add(new String[]{ id, text, speaker });
            }
        } catch (Exception ignored) {
        }
        return out;
    }

    private static SharedPreferences prefs(Context ctx) {
        return ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    private static PendingIntent tickIntent(Context ctx) {
        Intent i = new Intent(ctx, QuoteWidget.class);
        i.setAction(ACTION_TICK);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= 23) flags |= PendingIntent.FLAG_IMMUTABLE;
        return PendingIntent.getBroadcast(ctx, 72, i, flags);
    }

    public static void schedule(Context ctx) {
        try {
            AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
            int[] ids = mgr.getAppWidgetIds(new ComponentName(ctx, QuoteWidget.class));
            if (ids == null || ids.length == 0) {
                cancel(ctx);
                return;
            }
            AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;
            long ms = hours(ctx) * 3600L * 1000L;
            PendingIntent pi = tickIntent(ctx);
            am.cancel(pi);
            am.setInexactRepeating(
                    AlarmManager.ELAPSED_REALTIME,
                    SystemClock.elapsedRealtime() + ms,
                    ms,
                    pi);
        } catch (Exception ignored) {
        }
    }

    private static void cancel(Context ctx) {
        try {
            AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
            if (am != null) am.cancel(tickIntent(ctx));
        } catch (Exception ignored) {
        }
    }
}
