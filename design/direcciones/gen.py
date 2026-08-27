# Genera los 8 artboards (4 direcciones x hub+sudoku) del lienzo de direcciones.
import json, os

OUT = os.path.dirname(os.path.abspath(__file__))

# ── Estado de sudoku compartido (mismo tablero en las 4 direcciones) ─────
SOL = ["534678912","672195348","198342567","859761423","426853791",
       "713924856","961537284","287419635","345286179"]
MASK = ("101000101"
        "010110010"
        "001001100"
        "110010011"
        "000101000"
        "110010011"
        "001100100"
        "010011010"
        "101000101")
USER = {(0,3),(8,2)}
SEL = (4,4)
NOTES = {(1,0): ["2","4","7"]}

def sudoku_cells():
    out = []
    for r in range(9):
        for c in range(9):
            given = MASK[r*9+c] == "1"
            user = (r,c) in USER or (r,c) == SEL
            cls = ["cell"]
            if c in (2,5): cls.append("br")
            if r in (2,5): cls.append("bb")
            if (r,c) == SEL: cls.append("sel")
            body = ""
            if given:
                cls.append("g"); body = SOL[r][c]
            elif user:
                cls.append("u"); body = SOL[r][c]
            elif (r,c) in NOTES:
                cls.append("nt")
                body = '<span class="ns">' + "".join(f"<i>{d}</i>" for d in NOTES[(r,c)]) + "</span>"
            out.append(f'<div class="{" ".join(cls)}">{body}</div>')
    return "".join(out)

# ── Iconos compartidos (trazo, currentColor) ────────────────────────────
IC = {
"encadena": '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7.1-7.1l-1.7 1.7"></path><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7.1 7.1l1.7-1.7"></path></svg>',
"sopa": '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"></circle><path d="M21 21l-5.2-5.2"></path><path d="M8 10.5h5M10.5 8v5" opacity="0.55"></path></svg>',
"diagrama": '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3.5 3.5h17v17h-17z"></path><path d="M9.2 3.5v17M14.9 3.5v17M3.5 9.2h17M3.5 14.9h17" opacity="0.55"></path><rect x="9.2" y="3.5" width="5.7" height="5.7" fill="currentColor" stroke="none" opacity="0.9"></rect><rect x="3.5" y="14.9" width="5.7" height="5.7" fill="currentColor" stroke="none" opacity="0.9"></rect></svg>',
"sudoku": '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3.5 3.5h17v17h-17z"></path><path d="M9.2 3.5v17M14.9 3.5v17M3.5 9.2h17M3.5 14.9h17" opacity="0.55"></path><circle cx="6.3" cy="6.3" r="1.2" fill="currentColor" stroke="none"></circle><circle cx="17.7" cy="12" r="1.2" fill="currentColor" stroke="none"></circle><circle cx="12" cy="17.7" r="1.2" fill="currentColor" stroke="none"></circle></svg>',
"back": '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"></path></svg>',
"chev": '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"></path></svg>',
}

GAMES = [
    ("encadena", "Encadena", "Palabras por terminación"),
    ("sopa", "Sopa de letras", "Encuentra las escondidas"),
    ("diagrama", "Diagrama", "Acomoda las palabras"),
    ("sudoku", "Sudoku", "El clásico de números"),
]

# ── Direcciones ─────────────────────────────────────────────────────────
DIRS = {
# A · QUIOSCO — editorial de pasatiempos: papel, tinta y rojo de imprenta
"quiosco": dict(
    name="Quiosco", letter="A",
    fonts='<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo+Black&amp;family=Archivo:wght@400;500;600;700&amp;display=swap">',
    css="""
    .ph { width:390px; min-height:844px; background:#F6F5F1; color:#131210;
      font-family:'Archivo',system-ui,sans-serif; display:flex; flex-direction:column; }
    .disp { font-family:'Archivo Black','Arial Black',sans-serif; }
    .hub-head { padding:46px 24px 18px; border-bottom:3px solid #131210; }
    .hub-head h1 { margin:0; font-size:44px; line-height:1; letter-spacing:-.5px; text-transform:uppercase; }
    .hub-head h1 em { font-style:normal; color:#D8321F; }
    .hub-head .tag { display:flex; justify-content:space-between; margin-top:10px;
      font-size:11.5px; font-weight:700; letter-spacing:1.6px; text-transform:uppercase; color:#131210; }
    .cards { padding:20px 20px 8px; display:flex; flex-direction:column; gap:14px; }
    .gcard { display:flex; align-items:center; gap:14px; background:#FFFFFF; border:2px solid #131210;
      border-radius:6px; padding:16px 14px; box-shadow:4px 4px 0 #131210; }
    .gicon { width:48px; height:48px; flex-shrink:0; display:flex; align-items:center; justify-content:center;
      border:2px solid #131210; border-radius:4px; background:#F6F5F1; color:#131210; }
    .gcard:nth-child(2) .gicon, .gcard:nth-child(4) .gicon { background:#D8321F; color:#FFFFFF; border-color:#131210; }
    .gname { font-family:'Archivo Black',sans-serif; font-size:17px; text-transform:uppercase; letter-spacing:.2px; }
    .gsub { font-size:12.5px; color:#6E6A62; margin-top:2px; font-weight:500; }
    .gchev { margin-left:auto; color:#D8321F; }
    .foot { margin-top:auto; padding:16px 24px 26px; font-size:11px; font-weight:700; letter-spacing:1.4px;
      text-transform:uppercase; color:#9A958B; display:flex; justify-content:space-between; }
    /* sudoku */
    .top { display:flex; align-items:center; gap:12px; padding:46px 20px 14px; }
    .top .bk { width:40px; height:40px; border:2px solid #131210; border-radius:4px; background:#FFFFFF;
      display:flex; align-items:center; justify-content:center; box-shadow:3px 3px 0 #131210; }
    .top h2 { margin:0; font-family:'Archivo Black',sans-serif; font-size:24px; text-transform:uppercase; }
    .top .meta { margin-left:auto; text-align:right; }
    .top .diff { font-size:10.5px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:#D8321F; }
    .top .time { font-size:16px; font-weight:700; font-variant-numeric:tabular-nums; }
    .board { margin:10px auto 0; width:352px; border:3px solid #131210; background:#FFFFFF;
      display:grid; grid-template-columns:repeat(9,1fr); }
    .cell { aspect-ratio:1; display:flex; align-items:center; justify-content:center; font-size:19px;
      border-right:1px solid #D8D4CB; border-bottom:1px solid #D8D4CB; position:relative; }
    .cell.br { border-right:2.5px solid #131210; } .cell.bb { border-bottom:2.5px solid #131210; }
    .cell.g { font-weight:700; color:#131210; }
    .cell.u { font-weight:700; color:#D8321F; }
    .cell.sel { background:#FBE3DF; outline:2.5px solid #D8321F; outline-offset:-2.5px; }
    .ns { display:flex; gap:2px; position:absolute; top:3px; left:4px; }
    .ns i { font-style:normal; font-size:9px; font-weight:700; color:#9A958B; }
    .pad { margin:22px 20px 0; display:grid; grid-template-columns:repeat(5,1fr); gap:10px; }
    .key { height:56px; background:#FFFFFF; border:2px solid #131210; border-radius:4px; box-shadow:3px 3px 0 #131210;
      display:flex; align-items:center; justify-content:center; font-family:'Archivo Black',sans-serif; font-size:20px; }
    .key.fn { font-family:'Archivo',sans-serif; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; background:#D8321F; color:#FFFFFF; }
    """,
    hub_title='QUIOS<em>CO</em>', tagl="Pasatiempos en español", tagr="4 juegos",
    footl="Hecho en casa", footr="Sin conexión",
),
# B · ARCADIA — neón nocturno
"arcadia": dict(
    name="Arcadia", letter="B",
    fonts='<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Unbounded:wght@500;600;700;800&amp;family=Instrument+Sans:wght@400;500;600;700&amp;display=swap">',
    css="""
    .ph { width:390px; min-height:844px; background:#14121B; color:#F1EEF9;
      font-family:'Instrument Sans',system-ui,sans-serif; display:flex; flex-direction:column;
      background-image:radial-gradient(ellipse 90% 40% at 50% -5%, rgba(126,91,255,.22), transparent); }
    .disp { font-family:'Unbounded',sans-serif; }
    .hub-head { padding:52px 24px 20px; text-align:left; }
    .hub-head h1 { margin:0; font-family:'Unbounded',sans-serif; font-size:34px; font-weight:800; line-height:1;
      background:linear-gradient(100deg,#A88BFF,#53E6C6); -webkit-background-clip:text; background-clip:text; color:transparent; }
    .hub-head .tag { margin-top:10px; font-size:13px; color:#8D87A3; font-weight:500; }
    .cards { padding:14px 18px 8px; display:flex; flex-direction:column; gap:12px; }
    .gcard { display:flex; align-items:center; gap:14px; background:#1E1B29; border:1px solid rgba(255,255,255,.07);
      border-radius:20px; padding:16px 16px; }
    .gicon { width:50px; height:50px; flex-shrink:0; display:flex; align-items:center; justify-content:center;
      border-radius:14px; background:rgba(140,105,255,.14); color:#A88BFF; box-shadow:0 0 22px rgba(140,105,255,.25); }
    .gcard:nth-child(even) .gicon { background:rgba(60,220,190,.12); color:#53E6C6; box-shadow:0 0 22px rgba(60,220,190,.22); }
    .gname { font-family:'Unbounded',sans-serif; font-size:15px; font-weight:600; }
    .gsub { font-size:12.5px; color:#8D87A3; margin-top:3px; }
    .gchev { margin-left:auto; color:#544E6B; }
    .foot { margin-top:auto; padding:16px 24px 28px; font-size:12px; color:#544E6B; display:flex; justify-content:space-between; }
    /* sudoku */
    .top { display:flex; align-items:center; gap:12px; padding:50px 20px 14px; }
    .top .bk { width:40px; height:40px; border-radius:12px; background:#1E1B29; border:1px solid rgba(255,255,255,.08);
      display:flex; align-items:center; justify-content:center; color:#F1EEF9; }
    .top h2 { margin:0; font-family:'Unbounded',sans-serif; font-size:20px; font-weight:700; }
    .top .meta { margin-left:auto; text-align:right; }
    .top .diff { font-size:11px; font-weight:600; letter-spacing:1.2px; text-transform:uppercase; color:#53E6C6; }
    .top .time { font-size:16px; font-weight:600; color:#F1EEF9; font-variant-numeric:tabular-nums; }
    .board { margin:10px auto 0; width:352px; border-radius:14px; overflow:hidden; border:1.5px solid rgba(255,255,255,.16);
      background:#1B1826; display:grid; grid-template-columns:repeat(9,1fr); }
    .cell { aspect-ratio:1; display:flex; align-items:center; justify-content:center; font-size:18px;
      border-right:1px solid rgba(255,255,255,.06); border-bottom:1px solid rgba(255,255,255,.06); position:relative; }
    .cell.br { border-right:1.5px solid rgba(255,255,255,.22); } .cell.bb { border-bottom:1.5px solid rgba(255,255,255,.22); }
    .cell.g { font-weight:600; color:#F1EEF9; }
    .cell.u { font-weight:600; color:#A88BFF; }
    .cell.sel { background:rgba(83,230,198,.13); outline:2px solid #53E6C6; outline-offset:-2px;
      box-shadow:0 0 18px rgba(83,230,198,.35); }
    .ns { display:flex; gap:2px; position:absolute; top:3px; left:4px; }
    .ns i { font-style:normal; font-size:9px; color:#8D87A3; }
    .pad { margin:22px 20px 0; display:grid; grid-template-columns:repeat(5,1fr); gap:10px; }
    .key { height:56px; background:#211D30; border:1px solid rgba(255,255,255,.08); border-radius:16px;
      display:flex; align-items:center; justify-content:center; font-family:'Unbounded',sans-serif; font-size:17px; font-weight:600; color:#F1EEF9; }
    .key.fn { font-family:'Instrument Sans',sans-serif; font-size:11.5px; font-weight:700; letter-spacing:1px; text-transform:uppercase;
      background:linear-gradient(120deg,rgba(140,105,255,.25),rgba(60,220,190,.2)); color:#F1EEF9; }
    """,
    hub_title='Arcadia', tagl="Pasatiempos en español · 4 juegos", tagr="",
    footl="Hecho en casa", footr="Sin conexión",
),
# C · RECREO — pop de caramelo (cada juego con su color)
"recreo": dict(
    name="Recreo", letter="C",
    fonts='<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&amp;family=Schibsted+Grotesk:wght@400;500;600;700&amp;display=swap">',
    css="""
    .ph { width:390px; min-height:844px; background:#F4F2EC; color:#23222A;
      font-family:'Schibsted Grotesk',system-ui,sans-serif; display:flex; flex-direction:column; }
    .disp { font-family:'Bricolage Grotesque',sans-serif; }
    .hub-head { padding:52px 24px 16px; }
    .hub-head h1 { margin:0; font-family:'Bricolage Grotesque',sans-serif; font-size:42px; font-weight:800; line-height:1; letter-spacing:-.5px; }
    .hub-head h1 .dot { color:#FF5D73; }
    .hub-head .tag { margin-top:8px; font-size:13.5px; color:#8B8798; font-weight:500; }
    .cards { padding:14px 18px 8px; display:flex; flex-direction:column; gap:13px; }
    .gcard { display:flex; align-items:center; gap:14px; background:#FFFFFF; border-radius:24px; padding:16px 16px;
      box-shadow:0 2px 4px rgba(50,45,70,.05), 0 12px 28px rgba(50,45,70,.09); }
    .gicon { width:52px; height:52px; flex-shrink:0; display:flex; align-items:center; justify-content:center;
      border-radius:17px; color:#FFFFFF; transform:rotate(-3deg); }
    .c1 .gicon { background:#FF5D73; } .c2 .gicon { background:#21B8A6; }
    .c3 .gicon { background:#F5A623; } .c4 .gicon { background:#7C6BF0; }
    .gname { font-family:'Bricolage Grotesque',sans-serif; font-size:18px; font-weight:700; }
    .gsub { font-size:13px; color:#8B8798; margin-top:2px; }
    .gchev { margin-left:auto; color:#C9C5D2; }
    .foot { margin-top:auto; padding:16px 24px 28px; font-size:12.5px; color:#B3AFC0; display:flex; justify-content:space-between; }
    /* sudoku (violeta = su color de juego) */
    .top { display:flex; align-items:center; gap:12px; padding:50px 20px 14px; }
    .top .bk { width:42px; height:42px; border-radius:999px; background:#FFFFFF; box-shadow:0 2px 10px rgba(50,45,70,.1);
      display:flex; align-items:center; justify-content:center; color:#23222A; }
    .top h2 { margin:0; font-family:'Bricolage Grotesque',sans-serif; font-size:23px; font-weight:800; }
    .top .meta { margin-left:auto; text-align:right; }
    .top .diff { display:inline-block; font-size:11px; font-weight:700; color:#7C6BF0; background:#ECE8FD;
      border-radius:999px; padding:3px 10px; }
    .top .time { font-size:15.5px; font-weight:700; color:#23222A; margin-top:3px; font-variant-numeric:tabular-nums; }
    .board { margin:10px auto 0; width:352px; border-radius:18px; overflow:hidden; background:#FFFFFF;
      box-shadow:0 2px 4px rgba(50,45,70,.05), 0 14px 30px rgba(50,45,70,.1);
      display:grid; grid-template-columns:repeat(9,1fr); border:2px solid #E4E1EA; }
    .cell { aspect-ratio:1; display:flex; align-items:center; justify-content:center; font-size:18px;
      border-right:1px solid #EFEDF3; border-bottom:1px solid #EFEDF3; position:relative; }
    .cell.br { border-right:2px solid #C9C5D2; } .cell.bb { border-bottom:2px solid #C9C5D2; }
    .cell.g { font-weight:700; color:#23222A; }
    .cell.u { font-weight:700; color:#7C6BF0; }
    .cell.sel { background:#ECE8FD; outline:2.5px solid #7C6BF0; outline-offset:-2.5px; border-radius:8px; }
    .ns { display:flex; gap:2px; position:absolute; top:3px; left:4px; }
    .ns i { font-style:normal; font-size:9px; font-weight:600; color:#B3AFC0; }
    .pad { margin:22px 20px 0; display:grid; grid-template-columns:repeat(5,1fr); gap:10px; }
    .key { height:58px; background:#FFFFFF; border-radius:19px; box-shadow:0 2px 4px rgba(50,45,70,.06), 0 8px 18px rgba(50,45,70,.08);
      display:flex; align-items:center; justify-content:center; font-family:'Bricolage Grotesque',sans-serif; font-size:21px; font-weight:700; color:#23222A; }
    .key.fn { font-size:12px; font-family:'Schibsted Grotesk',sans-serif; font-weight:700; background:#7C6BF0; color:#FFFFFF; }
    """,
    hub_title='Recreo<span class="dot">.</span>', tagl="Pasatiempos en español · 4 juegos", tagr="",
    footl="Hecho en casa", footr="Sin conexión",
),
# D · CASILLAS — suizo modular
"casillas": dict(
    name="Casillas", letter="D",
    fonts='<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@400;500;600;700&amp;family=IBM+Plex+Mono:wght@400;500;600&amp;display=swap">',
    css="""
    .ph { width:390px; min-height:844px; background:#FBFBF8; color:#161719;
      font-family:'Familjen Grotesk',system-ui,sans-serif; display:flex; flex-direction:column; }
    .disp { font-family:'Familjen Grotesk',sans-serif; }
    .mono { font-family:'IBM Plex Mono',monospace; }
    .hub-head { padding:50px 24px 18px; border-bottom:1px solid #E4E3DC; }
    .hub-head h1 { margin:0; font-size:38px; font-weight:700; letter-spacing:-1px; line-height:1; }
    .hub-head h1 .sq { display:inline-block; width:13px; height:13px; background:#2545FF; margin-left:6px; }
    .hub-head .tag { margin-top:10px; display:flex; justify-content:space-between; font-size:11.5px; font-weight:600;
      letter-spacing:1.4px; text-transform:uppercase; color:#8D8C85; }
    .cards { padding:0; display:flex; flex-direction:column; }
    .gcard { display:flex; align-items:center; gap:16px; background:transparent; padding:20px 24px;
      border-bottom:1px solid #E4E3DC; }
    .gicon { width:44px; height:44px; flex-shrink:0; display:flex; align-items:center; justify-content:center;
      border:1.5px solid #161719; border-radius:8px; color:#161719; background:#FFFFFF; }
    .gnum { font-family:'IBM Plex Mono',monospace; font-size:11px; color:#8D8C85; margin-bottom:3px; }
    .gname { font-size:18px; font-weight:600; letter-spacing:-.2px; }
    .gsub { font-size:12.5px; color:#8D8C85; margin-top:2px; }
    .gchev { margin-left:auto; color:#2545FF; }
    .foot { margin-top:auto; padding:16px 24px 28px; font-family:'IBM Plex Mono',monospace; font-size:11px;
      color:#8D8C85; display:flex; justify-content:space-between; text-transform:uppercase; letter-spacing:.5px; }
    /* sudoku */
    .top { display:flex; align-items:center; gap:12px; padding:50px 20px 14px; }
    .top .bk { width:40px; height:40px; border:1.5px solid #161719; border-radius:8px; background:#FFFFFF;
      display:flex; align-items:center; justify-content:center; }
    .top h2 { margin:0; font-size:22px; font-weight:700; letter-spacing:-.4px; }
    .top .meta { margin-left:auto; text-align:right; }
    .top .diff { font-family:'IBM Plex Mono',monospace; font-size:11px; color:#2545FF; text-transform:uppercase; letter-spacing:1px; }
    .top .time { font-family:'IBM Plex Mono',monospace; font-size:15px; font-weight:600; }
    .board { margin:10px auto 0; width:352px; border:2px solid #161719; background:#FFFFFF;
      display:grid; grid-template-columns:repeat(9,1fr); }
    .cell { aspect-ratio:1; display:flex; align-items:center; justify-content:center;
      font-family:'IBM Plex Mono',monospace; font-size:17px;
      border-right:1px solid #E4E3DC; border-bottom:1px solid #E4E3DC; position:relative; }
    .cell.br { border-right:2px solid #161719; } .cell.bb { border-bottom:2px solid #161719; }
    .cell.g { font-weight:600; color:#161719; }
    .cell.u { font-weight:600; color:#2545FF; }
    .cell.sel { background:#E9EDFF; outline:2px solid #2545FF; outline-offset:-2px; }
    .ns { display:flex; gap:2px; position:absolute; top:3px; left:4px; }
    .ns i { font-style:normal; font-size:9px; color:#8D8C85; }
    .pad { margin:22px 20px 0; display:grid; grid-template-columns:repeat(5,1fr); gap:8px; }
    .key { height:54px; background:#FFFFFF; border:1.5px solid #161719; border-radius:8px;
      display:flex; align-items:center; justify-content:center; font-family:'IBM Plex Mono',monospace; font-size:18px; font-weight:600; }
    .key.fn { font-family:'Familjen Grotesk',sans-serif; font-size:12px; font-weight:700; letter-spacing:.8px;
      text-transform:uppercase; background:#2545FF; color:#FFFFFF; border-color:#2545FF; }
    """,
    hub_title='Casillas<span class="sq"></span>', tagl="Pasatiempos en español", tagr="4 juegos",
    footl="Hecho en casa", footr="Sin conexión",
),
}

def shell(d, body):
    return f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  {d['fonts']}
  <style>
    body {{ margin: 0; }}
    a {{ color: #2545FF; }} a:hover {{ color: #161719; }}
{d['css']}
  </style>
</helmet>
{body}
</x-dc>
</body>
</html>
"""

def hub_body(d):
    cards = []
    for i, (icid, name, sub) in enumerate(GAMES, start=1):
        num = f'<div class="gnum">0{i}</div>' if d["name"] == "Casillas" else ""
        cards.append(f"""    <div class="gcard c{i}">
      <div class="gicon">{IC[icid]}</div>
      <div>{num}<div class="gname">{name}</div><div class="gsub">{sub}</div></div>
      <div class="gchev">{IC['chev']}</div>
    </div>""")
    tagr = f'<span>{d["tagr"]}</span>' if d["tagr"] else ""
    return f"""<div class="ph">
  <div class="hub-head">
    <h1 class="disp">{d['hub_title']}</h1>
    <div class="tag"><span>{d['tagl']}</span>{tagr}</div>
  </div>
  <div class="cards">
{chr(10).join(cards)}
  </div>
  <div class="foot"><span>{d['footl']}</span><span>{d['footr']}</span></div>
</div>"""

def sudoku_body(d):
    keys = "".join(f'<div class="key">{n}</div>' for n in range(1, 10))
    return f"""<div class="ph">
  <div class="top">
    <div class="bk">{IC['back']}</div>
    <h2 class="disp">Sudoku</h2>
    <div class="meta"><div class="diff">Normal</div><div class="time">04:32</div></div>
  </div>
  <div class="board">{sudoku_cells()}</div>
  <div class="pad">{keys}<div class="key fn">Notas</div></div>
</div>"""

# ── Escribir artboards ──────────────────────────────────────────────────
files = {}
for key, d in DIRS.items():
    hub_name = "Main" if key == "recreo" else d["name"] + "Hub"
    files[hub_name] = shell(d, hub_body(d))
    files[d["name"] + "Sudoku"] = shell(d, sudoku_body(d))

for name, content in files.items():
    with open(os.path.join(OUT, name + ".dc.html"), "w", encoding="utf-8") as f:
        f.write(content)

# ── canvas.json ─────────────────────────────────────────────────────────
COLS = { "quiosco": 0, "arcadia": 520, "recreo": 1040, "casillas": 1560 }
artboards = []
for key, d in DIRS.items():
    x = COLS[key]
    hub_file = ("Main" if key == "recreo" else d["name"] + "Hub") + ".dc.html"
    artboards.append({ "file": hub_file, "x": x, "y": 0, "w": 390, "h": 844,
                       "title": f"{d['letter']} · {d['name']} — Hub" })
    artboards.append({ "file": d["name"] + "Sudoku.dc.html", "x": x, "y": 990, "w": 390, "h": 844,
                       "title": f"{d['letter']} · {d['name']} — Sudoku" })

annotations = [
  { "id": "intro", "x": -420, "y": 40, "w": 330,
    "text": "4 direcciones para la colección de juegos: mismo contenido, cuatro pieles.\n\nCada una estrena un nombre candidato — dirección y nombre se pueden mezclar (p. ej. la piel de Arcadia con el nombre Recreo).\n\nArriba el inicio (hub), abajo el Sudoku en esa piel." },
  { "id": "nota-quiosco", "x": 0, "y": -200, "w": 390,
    "text": "A · QUIOSCO — Editorial de pasatiempos\nPapel, tinta negra y rojo de imprenta, como las revistas de crucigramas del puesto de periódicos.\nTipos: Archivo Black + Archivo.\nPro: personalidad única, legibilísimo.\nContra: es el menos «app» de los cuatro." },
  { "id": "nota-arcadia", "x": 520, "y": -200, "w": 390,
    "text": "B · ARCADIA — Neón nocturno\nFondo oscuro, violeta y turquesa con brillos suaves.\nTipos: Unbounded + Instrument Sans.\nPro: se siente videojuego moderno y descansa la vista de noche.\nContra: al sol pide una variante clara." },
  { "id": "nota-recreo", "x": 1040, "y": -200, "w": 390,
    "text": "C · RECREO — Pop de caramelo\nClaro y juguetón: cada juego tiene su propio color (Sudoku violeta, Encadena coral…).\nTipos: Bricolage Grotesque + Schibsted Grotesk.\nPro: alegre, familiar, escala fácil a más juegos.\nContra: el más parecido a otras apps casuales." },
  { "id": "nota-casillas", "x": 1560, "y": -200, "w": 390,
    "text": "D · CASILLAS — Suizo modular\nBlanco, negro y un azul eléctrico; números en monoespaciada.\nTipos: Familjen Grotesk + IBM Plex Mono.\nPro: elegante y serio, envejece bien.\nContra: menos calidez, puede sentirse frío." },
]

canvas = { "artboards": artboards, "annotations": annotations, "launch": { "view": "canvas" } }
with open(os.path.join(OUT, "canvas.json"), "w", encoding="utf-8") as f:
    json.dump(canvas, f, ensure_ascii=False, indent=2)

print("artboards:", ", ".join(sorted(n + ".dc.html" for n in files)))
print("ok")
