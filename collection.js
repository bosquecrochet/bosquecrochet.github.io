const CATEGORIES = [
  { id: "all", name: "Todo", color: "#3b2d22" },
  { id: "amigurumi", name: "Criaturas", color: "#8c5947" },
  { id: "flores", name: "Flores y ramos", color: "#596f43" },
  { id: "navidad", name: "Invierno", color: "#8f3f34" },
  { id: "llaveros", name: "Talismanes", color: "#b58945" },
  { id: "hogar", name: "Refugio", color: "#547584" },
  { id: "accesorios", name: "Accesorios", color: "#6f657f" },
  { id: "letras", name: "Letras", color: "#7b6d5b" },
  { id: "textil", name: "Textil", color: "#5f7f85" },
  { id: "decoracion", name: "Decoración", color: "#9a6849" }
];

const PROJECTS = [
["WhatsApp Image 2026-05-22 at 16.55.24.jpeg","Camisa con muñeca colgante","accesorios","Broche o colgante textil aplicado sobre camisa.",["muñeca","colgante","ropa"]],
["WhatsApp Image 2026-05-22 at 16.55.25 (1).jpeg","Ratón colgante gris","amigurumi","Ratón tejido con cola larga y patitas rosas.",["ratón","animal","colgante"]],
["WhatsApp Image 2026-05-22 at 16.55.25 (2).jpeg","Ratón amigurumi tumbado","amigurumi","Versión alargada del ratón con detalles bordados.",["ratón","animal"]],
["WhatsApp Image 2026-05-22 at 16.55.25.jpeg","Ratón gris con orejas rosas","amigurumi","Figura tejida en gris con bigotes negros.",["ratón","animal"]],
["WhatsApp Image 2026-05-22 at 16.55.27.jpeg","Molino de viento decorativo","llaveros","Colgante con aspas de colores y borla rosa.",["colgante","borla","color"]],
["WhatsApp Image 2026-05-22 at 16.55.28 (1).jpeg","Inicial con arcoiris","llaveros","Llavero personalizado con letra, arcoiris y borla.",["inicial","regalo","borla"]],
["WhatsApp Image 2026-05-22 at 16.55.28 (2).jpeg","Maceta azul con flores","flores","Arreglo floral de crochet en maceta.",["maceta","flores","decoración"]],
["WhatsApp Image 2026-05-22 at 16.55.28.jpeg","Inicial N rosa","llaveros","Llavero de letra N tejido en rosa con detalle floral.",["inicial","letra","llavero"]],
["WhatsApp Image 2026-05-22 at 16.55.29.jpeg","Limón amigurumi","amigurumi","Pequeño fruto tejido con hoja verde.",["fruta","limón"]],
["WhatsApp Image 2026-05-22 at 16.55.30 (1).jpeg","Pollito corona","llaveros","Llavero de pollito con corona y detalles rojos.",["pollito","llavero"]],
["WhatsApp Image 2026-05-22 at 16.55.30.jpeg","Búho multicolor","llaveros","Búho pequeño tejido con ojos grandes.",["búho","llavero"]],
["WhatsApp Image 2026-05-22 at 16.55.31 (1).jpeg","Carita rosa kawaii","llaveros","Llavero redondo con orejas y expresión alegre.",["kawaii","llavero"]],
["WhatsApp Image 2026-05-22 at 16.55.31 (2).jpeg","Abeja azul y amarilla","llaveros","Abejita tejida sobre bastidor.",["abeja","animal"]],
["WhatsApp Image 2026-05-22 at 16.55.31 (3).jpeg","Pollito amarillo","llaveros","Colgante de pollito de crochet.",["pollito","animal"]],
["WhatsApp Image 2026-05-22 at 16.55.31 (4).jpeg","Pollito blanco con estrella","llaveros","Figura colgante con patas largas y estrella.",["pollito","estrella"]],
["WhatsApp Image 2026-05-22 at 16.55.31.jpeg","Pollito corona II","llaveros","Segunda versión del pollito con corona.",["pollito","llavero"]],
["WhatsApp Image 2026-05-22 at 16.55.32 (1).jpeg","Cesta de flores variadas","flores","Ramo grande en cesta con girasol y flores de colores.",["ramo","cesta","girasol"]],
["WhatsApp Image 2026-05-22 at 16.55.32 (2).jpeg","Lazo navideño de rayas","navidad","Lazo rojo y blanco con detalle floral.",["lazo","navidad"]],
["WhatsApp Image 2026-05-22 at 16.55.32.jpeg","Trío de llaveros kawaii","llaveros","Conjunto de colgantes pequeños para colección.",["set","llaveros"]],
["WhatsApp Image 2026-05-22 at 16.55.33 (1).jpeg","Corona navideña con campanas","navidad","Aro rojo y verde con dos campanas.",["corona","campanas"]],
["WhatsApp Image 2026-05-22 at 16.55.33 (2).jpeg","Corona roja con flores","navidad","Aro decorativo con flores blancas y rojas.",["corona","flores"]],
["WhatsApp Image 2026-05-22 at 16.55.33 (3).jpeg","Bola navideña en aro","navidad","Adorno circular con bola roja y blanca.",["bola","adorno"]],
["WhatsApp Image 2026-05-22 at 16.55.33.jpeg","Corazón navideño","navidad","Corazón tejido rojo y verde con lazo.",["corazón","lazo"]],
["WhatsApp Image 2026-05-22 at 16.55.35 (1).jpeg","Calendario de adviento tela","navidad","Calendario colgante con bolsillos numerados.",["adviento","calendario"]],
["WhatsApp Image 2026-05-22 at 16.55.35 (2).jpeg","Calendario de adviento rojo","navidad","Panel navideño de bolsillos para diciembre.",["adviento","calendario"]],
["WhatsApp Image 2026-05-22 at 16.55.35 (3).jpeg","Papá Noel corona","navidad","Adorno circular con traje rojo y hebilla.",["santa","adorno"]],
["WhatsApp Image 2026-05-22 at 16.55.35.jpeg","Estrella navideña colgante","navidad","Estrella decorada con pequeños motivos.",["estrella","colgante"]],
["WhatsApp Image 2026-05-22 at 16.55.36 (1).jpeg","Joyero rosa","hogar","Caja decorada con textura de crochet.",["caja","joyero"]],
["WhatsApp Image 2026-05-22 at 16.55.36.jpeg","Joyero con rosas","hogar","Caja rosa con tres flores superiores.",["caja","rosas"]],
["WhatsApp Image 2026-05-22 at 16.55.37 (1).jpeg","Jarrón de flores vivas","flores","Ramo de flores tejidas en tonos azul y naranja.",["ramo","jarrón"]],
["WhatsApp Image 2026-05-22 at 16.55.37 (2).jpeg","Jarrón multicolor","flores","Flores de crochet con tallos largos.",["ramo","jarrón"]],
["WhatsApp Image 2026-05-22 at 16.55.37 (3).jpeg","Planta de hojas rojas","flores","Maceta con follaje textil rojizo y verde.",["planta","maceta"]],
["WhatsApp Image 2026-05-22 at 16.55.37.jpeg","Ramo bajo lámpara","flores","Flores naranjas y azules en vaso decorativo.",["ramo","lámpara"]],
["WhatsApp Image 2026-05-22 at 16.55.38.jpeg","Girasol con abeja","flores","Girasol individual con pequeña abeja.",["girasol","abeja"]],
["WhatsApp Image 2026-05-22 at 16.55.40 (1).jpeg","Ramo floral en cesta","flores","Composición de flores de colores en cesta.",["ramo","flores"]],
["WhatsApp Image 2026-05-22 at 16.55.40.jpeg","Pascuero de crochet","flores","Planta roja tipo flor de Pascua en maceta.",["pascua","planta"]],
["WhatsApp Image 2026-05-22 at 16.55.41 (1).jpeg","Cesta unicornio bebé","decoracion","Cesta decorativa con unicornio y envoltorio.",["unicornio","cesta"]],
["WhatsApp Image 2026-05-22 at 16.55.41 (2).jpeg","Luna con osito","decoracion","Cuadro colgante con luna rosa y oso.",["luna","oso"]],
["WhatsApp Image 2026-05-22 at 16.55.41.jpeg","Ramo de tulipanes","flores","Tulipanes y flores de colores en jarrón.",["tulipanes","ramo"]],
["WhatsApp Image 2026-05-22 at 16.55.42.jpeg","Guirnalda de letras Alma","letras","Nombre tejido en letras colgantes.",["nombre","letras"]],
["WhatsApp Image 2026-05-22 at 16.55.43 (1).jpeg","Miniaturas dulces y flores","hogar","Conjunto de tazas, postres y flores tejidas.",["miniaturas","set"]],
["WhatsApp Image 2026-05-22 at 16.55.43 (2).jpeg","Cuadro de margaritas","flores","Margaritas blancas en maceta sobre fondo claro.",["margaritas","cuadro"]],
["WhatsApp Image 2026-05-22 at 16.55.43 (3).jpeg","Reno navideño","navidad","Cara de reno tejida para colgar.",["reno","navidad"]],
["WhatsApp Image 2026-05-22 at 16.55.43.jpeg","Pascuero sobre mueble","flores","Flor de Pascua en maceta decorativa.",["pascua","maceta"]],
["WhatsApp Image 2026-05-22 at 16.55.44.jpeg","Tres búhos colgantes","llaveros","Trío de búhos en tonos pastel.",["búhos","colgantes"]],
["WhatsApp Image 2026-05-22 at 16.55.45.jpeg","Móvil de llaveros","llaveros","Conjunto de colgantes y motivos pequeños.",["móvil","colgantes"]],
["WhatsApp Image 2026-05-22 at 16.55.46 (1).jpeg","Ramo en sombra","flores","Arreglo floral con silueta proyectada.",["ramo","decoración"]],
["WhatsApp Image 2026-05-22 at 16.55.46 (2).jpeg","Rosa rosa colgante","flores","Flor individual tejida con tallo verde.",["rosa","flor"]],
["WhatsApp Image 2026-05-22 at 16.55.46.jpeg","Maceta con flor azul","flores","Planta de crochet con muñeco en la base.",["planta","flor"]],
["WhatsApp Image 2026-05-22 at 16.56.14 (1).jpeg","Árbol floral blanco","flores","Estructura vertical con flores blancas.",["flores","árbol"]],
["WhatsApp Image 2026-05-22 at 16.56.14.jpeg","Borlas azules decorativas","accesorios","Conjunto de borlas y ojos decorativos.",["borlas","azul"]],
["WhatsApp Image 2026-05-22 at 16.56.15 (1).jpeg","Ramo de tulipanes abierto","flores","Flores rosas y blancas con hojas verdes.",["tulipanes","ramo"]],
["WhatsApp Image 2026-05-22 at 16.56.15 (10).jpeg","Rama floral decorativa","flores","Composición de flores sobre rama alta.",["rama","flores"]],
["WhatsApp Image 2026-05-22 at 16.56.15 (11).jpeg","Cojín serpiente naranja","hogar","Cojín largo con forma de serpiente.",["cojín","serpiente"]],
["WhatsApp Image 2026-05-22 at 16.56.15 (12).jpeg","Nube amigurumi","amigurumi","Nube blanca con patas marrones.",["nube","kawaii"]],
["WhatsApp Image 2026-05-22 at 16.56.15 (2).jpeg","Jarrón azul con flores","flores","Ramo de flores azules y blancas.",["ramo","azul"]],
["WhatsApp Image 2026-05-22 at 16.56.15 (3).jpeg","Mariposas y huevos pastel","decoracion","Conjunto decorativo con dos figuras redondas.",["mariposas","pastel"]],
["WhatsApp Image 2026-05-22 at 16.56.15 (4).jpeg","Estantería floral","flores","Varios arreglos de flores y macetas.",["estantería","flores"]],
["WhatsApp Image 2026-05-22 at 16.56.15 (5).jpeg","Ramo en mesa redonda","flores","Ramo de flores multicolor sobre mesa.",["ramo","mesa"]],
["WhatsApp Image 2026-05-22 at 16.56.15 (6).jpeg","Ramo rojo y blanco","flores","Arreglo de flores rojas, blancas y rosas.",["ramo","rojo"]],
["WhatsApp Image 2026-05-22 at 16.56.15 (7).jpeg","Orquídea blanca","flores","Rama de flores blancas en maceta.",["orquídea","blanco"]],
["WhatsApp Image 2026-05-22 at 16.56.15 (8).jpeg","Ramo azul alto","flores","Flores azules en jarrón de cristal.",["ramo","azul"]],
["WhatsApp Image 2026-05-22 at 16.56.15 (9).jpeg","Estantería con flores blancas","flores","Composición de orquídeas y flores.",["flores","estantería"]],
["WhatsApp Image 2026-05-22 at 16.56.15.jpeg","Cuadro de orquídea fucsia","flores","Orquídea sobre soporte oscuro.",["orquídea","cuadro"]],
["WhatsApp Image 2026-05-22 at 16.56.16 (1).jpeg","Familia Totoro","amigurumi","Grupo de figuras inspiradas en Totoro.",["totoro","familia"]],
["WhatsApp Image 2026-05-22 at 16.56.16 (2).jpeg","Nombre Lucía con utensilios","letras","Letras colgantes con motivos de cocina.",["nombre","letras"]],
["WhatsApp Image 2026-05-22 at 16.56.16 (3).jpeg","Lirios rosas","flores","Flores alargadas sobre fondo rayado.",["lirios","flores"]],
["WhatsApp Image 2026-05-22 at 16.56.16 (4).jpeg","Lirios pastel","flores","Variante de lirios con tallos negros.",["lirios","pastel"]],
["WhatsApp Image 2026-05-22 at 16.56.16 (5).jpeg","Conjunto navideño mini","navidad","Gorro, bufanda, bolsito y bastón.",["navidad","set"]],
["WhatsApp Image 2026-05-22 at 16.56.16 (6).jpeg","Pepino amigurumi","amigurumi","Figura verde alargada con ojos grandes.",["verdura","kawaii"]],
["WhatsApp Image 2026-05-22 at 16.56.16 (7).jpeg","Trío Totoro","amigurumi","Totoro grande con dos figuras pequeñas.",["totoro","set"]],
["WhatsApp Image 2026-05-22 at 16.56.16 (8).jpeg","Ramo con girasol rojo","flores","Jarrón con girasol y flores rojas.",["girasol","ramo"]],
["WhatsApp Image 2026-05-22 at 16.56.16 (9).jpeg","Vestido morado","textil","Prenda pequeña de crochet con botones.",["vestido","ropa"]],
["WhatsApp Image 2026-05-22 at 16.56.16.jpeg","Margaritas en mantel","flores","Ramo de margaritas blancas.",["margaritas","ramo"]],
["WhatsApp Image 2026-05-22 at 16.56.17 (1).jpeg","Totoro de espaldas","amigurumi","Figura Totoro vista trasera.",["totoro","animal"]],
["WhatsApp Image 2026-05-22 at 16.56.17 (2).jpeg","Totoro frontal","amigurumi","Totoro gris con ojos grandes.",["totoro","frontal"]],
["WhatsApp Image 2026-05-22 at 16.56.17 (3).jpeg","Letras luminosas Maia","letras","Decoración con nombre y luces.",["nombre","luces"]],
["WhatsApp Image 2026-05-22 at 16.56.17 (4).jpeg","Pokémon amigurumi set","amigurumi","Conjunto de figuras de colores.",["pokemon","set"]],
["WhatsApp Image 2026-05-22 at 16.56.17 (5).jpeg","Cuaderno Stitch","textil","Cuaderno decorado con personaje Stitch.",["stitch","cuaderno"]],
["WhatsApp Image 2026-05-22 at 16.56.17 (6).jpeg","Accesorios Stitch","accesorios","Llavero y funda con motivos de Stitch.",["stitch","funda"]],
["WhatsApp Image 2026-05-22 at 16.56.17 (7).jpeg","Escarabajo rojo","amigurumi","Insecto tejido con cuerpo rojo y negro.",["insecto","escarabajo"]],
["WhatsApp Image 2026-05-22 at 16.56.17 (8).jpeg","Casita de cuento lateral","hogar","Casa decorativa con tejado naranja.",["casa","decoración"]],
["WhatsApp Image 2026-05-22 at 16.56.17.jpeg","Zapatillas bebé","textil","Patucos tejidos en varios colores.",["bebé","patucos"]],
["WhatsApp Image 2026-05-22 at 16.56.18 (1).jpeg","Casita de cuento frontal","hogar","Casa de crochet con ventanas y flores.",["casa","maqueta"]],
["WhatsApp Image 2026-05-22 at 16.56.18 (2).jpeg","Casita abierta","hogar","Vista superior de la casita decorativa.",["casa","tejado"]],
["WhatsApp Image 2026-05-22 at 16.56.18 (3).jpeg","Casita con asa","hogar","Casa tejida con asa superior.",["casa","asa"]],
["WhatsApp Image 2026-05-22 at 16.56.18 (4).jpeg","Casita lateral","hogar","Lateral de casa con valla blanca.",["casa","valla"]],
["WhatsApp Image 2026-05-22 at 16.56.18 (5).jpeg","Chaqueta azul bebé","textil","Prenda azul con botones blancos.",["bebé","chaqueta"]],
["WhatsApp Image 2026-05-22 at 16.56.18 (6).jpeg","Nombre Maia con mariposas","letras","Nombre colgante con mariposa blanca.",["nombre","mariposa"]],
["WhatsApp Image 2026-05-22 at 16.56.18 (7).jpeg","Unicornio de pared","decoracion","Cabeza de unicornio con melena multicolor.",["unicornio","pared"]],
["WhatsApp Image 2026-05-22 at 16.56.18 (8).jpeg","Caravana de amigurumis","amigurumi","Grupo de personajes pequeños de colores.",["personajes","set"]],
["WhatsApp Image 2026-05-22 at 16.56.18 (9).jpeg","Casita de cuento final","hogar","Vista general de la casa tejida.",["casa","decoración"]],
["WhatsApp Image 2026-05-22 at 16.56.18.jpeg","Muñeca de anime","amigurumi","Figura con sombrero de paja y ropa azul.",["muñeca","anime"]],
["WhatsApp Image 2026-05-22 at 16.56.19 (1).jpeg","Capitán América trasero","amigurumi","Muñeco de superhéroe visto por detrás.",["superhéroe","muñeco"]],
["WhatsApp Image 2026-05-22 at 16.56.19 (2).jpeg","Capitán América","amigurumi","Muñeco azul con escudo y letra A.",["superhéroe","capitán"]],
["WhatsApp Image 2026-05-22 at 16.56.19 (3).jpeg","Gnomo blanco rosa","navidad","Gnomo con gorro blanco y pompón rosa.",["gnomo","navidad"]],
["WhatsApp Image 2026-05-22 at 16.56.19 (4).jpeg","Gnomo rojo verde","navidad","Gnomo de barba verde con gorro rojo.",["gnomo","navidad"]],
["WhatsApp Image 2026-05-22 at 16.56.19 (5).jpeg","Muñeca rosa","amigurumi","Figura humana con vestido rosa.",["muñeca","ropa"]],
["WhatsApp Image 2026-05-22 at 16.56.19.jpeg","Colgador de pulseras","accesorios","Marco de madera con tiras y pulseras.",["pulseras","organizador"]],
["WhatsApp Image 2026-05-22 at 16.56.39.jpeg","Gnomo blanco rojo","navidad","Gnomo sentado con gorro blanco.",["gnomo","navidad"]],
["WhatsApp Image 2026-05-22 at 16.56.40.jpeg","Stitch rosa","amigurumi","Figura rosa inspirada en Stitch.",["stitch","personaje"]],
["WhatsApp Image 2026-05-22 at 16.56.41 (1).jpeg","Gnomo blanco corazón","navidad","Gnomo con corazón rojo en la barba.",["gnomo","corazón"]],
["WhatsApp Image 2026-05-22 at 16.56.41 (2).jpeg","Hoguera decorativa","hogar","Fuego tejido con troncos y llamas.",["hoguera","decoración"]],
["WhatsApp Image 2026-05-22 at 16.56.41 (3).jpeg","Stitch rojo","amigurumi","Figura roja inspirada en Stitch.",["stitch","personaje"]],
["WhatsApp Image 2026-05-22 at 16.56.41.jpeg","Stitch rojo grande","amigurumi","Versión grande de Stitch rojo.",["stitch","grande"]]
].map((p, index) => ({
  id: index + 1,
  file: p[0],
  title: p[1],
  cat: p[2],
  desc: p[3],
  tags: p[4],
  date: "2026-05-22",
  source: "carpeta"
}));

function groupKey(project) {
  const text = `${project.title} ${(project.tags || []).join(" ")}`.toLowerCase();
  if (text.includes("totoro")) return "grupo-totoro";
  if (text.includes("casita de cuento")) return "grupo-casita-cuento";
  if (text.includes("capitán américa") || text.includes("capitan america")) return "grupo-capitan-america";
  if (text.includes("ratón") || text.includes("raton")) return "grupo-raton";
  if (text.includes("pollito")) return "grupo-pollito";
  if (text.includes("calendario de adviento")) return "grupo-adviento";
  if (text.includes("joyero")) return "grupo-joyero";
  return String(project.id);
}

function groupTitle(key, fallback) {
  return {
    "grupo-totoro": "Colección Totoro",
    "grupo-casita-cuento": "Casita de cuento",
    "grupo-capitan-america": "Capitán América",
    "grupo-raton": "Ratón de crochet",
    "grupo-pollito": "Pollitos colgantes",
    "grupo-adviento": "Calendarios de adviento",
    "grupo-joyero": "Joyeros de crochet"
  }[key] || fallback;
}

function builtInProjects() {
  const groups = new Map();
  PROJECTS.forEach(project => {
    const key = groupKey(project);
    if (!groups.has(key)) {
      groups.set(key, {
        idKey: key,
        title: groupTitle(key, project.title),
        cat: project.cat,
        desc: project.desc,
        tags: [...(project.tags || [])],
        date: project.date,
        source: "colección",
        media: []
      });
    }
    const group = groups.get(key);
    group.media.push({ type: "image", src: project.file, name: project.title });
    group.tags = [...new Set([...(group.tags || []), ...(project.tags || [])])];
  });
  return [...groups.values()];
}


export { CATEGORIES, builtInProjects };
