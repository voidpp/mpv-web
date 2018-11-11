About
-----

Web application for [MPV HTTP Router](https://github.com/voidpp/mpv-http-router), designed for mobile.

Scheme
------
```
+------------------------------------------+
|  +------+                                |
|  | mpv1 |----+        Computer 1         |
|  +------+    |                           |
|              |                           |
|  +------+    |    +-----------------+    |   +---------+
|  | mpv2 |----+----| MPV HTTP Router |----|---| MPV Web |
|  +------+    |    +-----------------+\   |   +---------+
|              |                        |  |
|  +------+    |                        |  |   +-------------+
|  | mpv3 |----+                        |  |   |  MPVRemote  |
|  +------+                             +--|---|   +---------+
+------------------------------------------+   |   | MPV Web |
                                               +---+---------+
```

MPV HTTP Router: https://github.com/voidpp/mpv-http-router
MPV Web: https://github.com/voidpp/mpv-web
MPVRemote: https://github.com/voidpp/MPVRemote

Development
-----------

run dev server: `npm start`

build production app: `npm run build`
