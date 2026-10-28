# Cyber Metro visual references

The route map uses original AK and G lettering for the blog's fictional railways.

Reference material:

- Tokyo Metro CI Design System: https://www.tokyometro.jp/support/trademark/pdf/guideline.pdf
- Marunouchi Line route symbols and station numbering: https://www.tokyometro.jp/station/line_marunouchi/index.html
- JR East station numbering: https://www.jreast.co.jp/press/2016/20160402.pdf
- Tokyo Metro network map: https://www.tokyometro.jp/station/202303_number_ja.pdf

AK uses a green rectangular border, white face, and black stacked line and station numbers. G uses a thick red circular border, white face, and black stacked line and station numbers. Japanese map labels use Noto Sans JP with system Gothic fallbacks; article headings and prose use serif fonts.

The entry animation uses the original flat architectural illustration `assets/metro/skyline.svg` and an E5 train silhouette animated by `assets/metro.js`. Station article lists have a plain background. No generated aerial artwork is included in the website.

E5 train shape reference: https://www.jreast.co.jp/train/shinkan/e5.html and https://trainsface.art.coocan.jp/site2005/railway/jr_jnr/detail/e5_sideview_zoom.html. The black vector is an original simplified side silhouette with a low elongated nose, raised cab, smooth roof shoulder, and covered underbody.

Category platforms appear in card mode only and are rendered by `assets/station-platform.js`. AK runs in a loop from AK01 先端 through AK08 文藝; G runs from G01 高校時代 to G04 旅 (`/travel`). CST and 先端 support transfers. The selected platform line follows the journey. The train motion shares the opening animation's 2.7-second curve; reduced-motion users navigate directly.

The white station boards reference the user-supplied Japanese station sign photograph. Original vector train drawings reference JR East's [E235 exterior](https://www.jreast.co.jp/press/2016/20160606.pdf) and Tokyo Metro's [Marunouchi 2000 series](https://www.tokyometro.jp/news/2019/195311.html).

Opening skyline order, left to right: China, Japan, Southeast Asia, Europe, United States.

Skyline silhouettes: Chinese apartment slabs and recessed balconies; Japanese machiya lattices, layered eaves and utility wires; Southeast Asian shophouse arcades, shutters and a palm; European stepped gables, mansard dormers and chimneys; American setback towers, rooftop water tanks and fire escapes. The full composition is fitted without side cropping.
