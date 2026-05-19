// Bootstrap GUI Editor - Pre-built Page Templates
import type { CanvasComponent } from "./types";
import { LayoutTemplate, LogIn, LayoutDashboard, DollarSign, FileText, Images, Mail, AlertTriangle, HelpCircle, Users, PanelBottom as FooterIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ── Unique ID generator for templates ──
let tplCounter = 0;
function tplId(prefix: string): string {
  return `tpl-${prefix}-${Date.now()}-${++tplCounter}`;
}

// ── Template definition type ──
export interface TemplateDefinition {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  components: CanvasComponent[];
}

// ── Helper: create a col with children ──
function makeCol(size: string, children: CanvasComponent[]): CanvasComponent {
  return {
    id: tplId("col"),
    type: "col",
    label: "Column",
    props: { size, bgColor: "transparent", textColor: "dark", padding: "3", textAlign: "start" },
    children,
  };
}

// ── Helper: create a row with cols ──
function makeRow(colCount: number, colChildren: CanvasComponent[][]): CanvasComponent {
  return {
    id: tplId("row"),
    type: "row",
    label: "Row",
    props: { cols: String(colCount), gutter: "3", verticalAlign: "start" },
    children: colChildren.map((ch, i) => makeCol(String(Math.floor(12 / colCount)), ch)),
  };
}

// ────────────────────────────────────────────────
// TEMPLATE 1: Landing Page
// ────────────────────────────────────────────────
const landingTemplate: CanvasComponent[] = [
  // Hero container
  {
    id: tplId("container"),
    type: "container",
    label: "Container",
    props: { fluid: "fluid", bgColor: "primary", padding: "5", textColor: "white", textAlign: "center" },
    children: [
      {
        id: tplId("heading"),
        type: "heading",
        label: "Heading",
        props: { text: "Benvenuto nel Nostro Sito", level: "1", displayClass: "2", textColor: "", textAlign: "center", textClass: "" },
      },
      {
        id: tplId("paragraph"),
        type: "paragraph",
        label: "Paragraph",
        props: { text: "Creiamo esperienze digitali straordinarie per la tua azienda. Scopri i nostri servizi e trasforma la tua presenza online.", lead: true, textColor: "", textAlign: "center", textSize: "lead" },
      },
      {
        id: tplId("btn"),
        type: "button",
        label: "Button",
        props: { text: "Inizia Ora", variant: "light", outline: false, size: "lg", disabled: false, block: false, iconLeft: "" },
      },
    ],
  },
  // Cards row
  {
    id: tplId("container"),
    type: "container",
    label: "Container",
    props: { fluid: "fixed", bgColor: "transparent", padding: "5", textColor: "dark", textAlign: "start" },
    children: [
      makeRow(3, [
        [
          {
            id: tplId("card"),
            type: "card",
            label: "Card",
            props: { header: "", title: "Progettazione", subtitle: "", text: "Progettiamo interfacce intuitive e moderne che catturano l'attenzione dei tuoi utenti.", footer: "", imgSrc: "", variant: "", borderColor: "primary", textAlign: "center" },
          },
        ],
        [
          {
            id: tplId("card"),
            type: "card",
            label: "Card",
            props: { header: "", title: "Sviluppo", subtitle: "", text: "Sviluppiamo applicazioni web robuste e scalabili con le tecnologie più avanzate.", footer: "", imgSrc: "", variant: "", borderColor: "success", textAlign: "center" },
          },
        ],
        [
          {
            id: tplId("card"),
            type: "card",
            label: "Card",
            props: { header: "", title: "Consulenza", subtitle: "", text: "Offriamo consulenza strategica per guidare la tua trasformazione digitale con successo.", footer: "", imgSrc: "", variant: "", borderColor: "info", textAlign: "center" },
          },
        ],
      ]),
    ],
  },
];

// ────────────────────────────────────────────────
// TEMPLATE 2: Login Form
// ────────────────────────────────────────────────
const loginTemplate: CanvasComponent[] = [
  {
    id: tplId("container"),
    type: "container",
    label: "Container",
    props: { fluid: "fixed", bgColor: "light", padding: "5", textColor: "dark", textAlign: "center" },
    children: [
      {
        id: tplId("row"),
        type: "row",
        label: "Row",
        props: { cols: "3", gutter: "3", verticalAlign: "center" },
        children: [
          // Empty left col
          makeCol("4", []),
          // Center col with card + form
          makeCol("4", [
            {
              id: tplId("card"),
              type: "card",
              label: "Card",
              props: { header: "Accedi al tuo account", title: "", subtitle: "", text: "", footer: "", imgSrc: "", variant: "", borderColor: "", textAlign: "start" },
              children: [
                {
                  id: tplId("input-email"),
                  type: "input",
                  label: "Input",
                  props: { label: "Indirizzo email", type: "email", placeholder: "nome@esempio.it", helpText: "", size: "", disabled: false, readonly: false, required: true, floating: false, plaintext: false },
                },
                {
                  id: tplId("input-pass"),
                  type: "input",
                  label: "Input",
                  props: { label: "Password", type: "password", placeholder: "Inserisci la password", helpText: "", size: "", disabled: false, readonly: false, required: true, floating: false, plaintext: false },
                },
                {
                  id: tplId("checkbox"),
                  type: "checkbox",
                  label: "Checkbox",
                  props: { label: "Ricordami", checked: false, disabled: false, inline: false, reverse: true },
                },
                {
                  id: tplId("btn-login"),
                  type: "button",
                  label: "Button",
                  props: { text: "Accedi", variant: "primary", outline: false, size: "lg", disabled: false, block: true, iconLeft: "" },
                },
              ],
            },
          ]),
          // Empty right col
          makeCol("4", []),
        ],
      },
    ],
  },
];

// ────────────────────────────────────────────────
// TEMPLATE 3: Dashboard
// ────────────────────────────────────────────────
const dashboardTemplate: CanvasComponent[] = [
  // Navbar
  {
    id: tplId("navbar"),
    type: "navbar",
    label: "Navbar",
    props: { brand: "Pannello di Controllo", items: "Dashboard, Statistiche, Impostazioni", variant: "dark", expand: "lg", bgColor: "dark", container: "fluid" },
  },
  // Stats row
  {
    id: tplId("container"),
    type: "container",
    label: "Container",
    props: { fluid: "fixed", bgColor: "transparent", padding: "4", textColor: "dark", textAlign: "start" },
    children: [
      makeRow(4, [
        [
          {
            id: tplId("card-stat1"),
            type: "card",
            label: "Card",
            props: { header: "", title: "Utenti Attivi", subtitle: "", text: "1.245 utenti registrati questa settimana", footer: "", imgSrc: "", variant: "primary", borderColor: "", textAlign: "center" },
          },
        ],
        [
          {
            id: tplId("card-stat2"),
            type: "card",
            label: "Card",
            props: { header: "", title: "Vendite", subtitle: "", text: "€ 12.340 di fatturato mensile", footer: "", imgSrc: "", variant: "success", borderColor: "", textAlign: "center" },
          },
        ],
        [
          {
            id: tplId("card-stat3"),
            type: "card",
            label: "Card",
            props: { header: "", title: "Ordini", subtitle: "", text: "89 ordini in elaborazione", footer: "", imgSrc: "", variant: "warning", borderColor: "", textAlign: "center" },
          },
        ],
        [
          {
            id: tplId("card-stat4"),
            type: "card",
            label: "Card",
            props: { header: "", title: "Messaggi", subtitle: "", text: "34 nuovi messaggi non letti", footer: "", imgSrc: "", variant: "info", borderColor: "", textAlign: "center" },
          },
        ],
      ]),
      // Heading
      {
        id: tplId("heading"),
        type: "heading",
        label: "Heading",
        props: { text: "Ultimi Ordini", level: "3", displayClass: "", textColor: "", textAlign: "start", textClass: "" },
      },
      // Table
      {
        id: tplId("table"),
        type: "table",
        label: "Table",
        props: {
          headers: "ID|Cliente|Prodotto|Importo|Stato",
          numRows: 5,
          striped: true,
          bordered: true,
          hover: true,
          condensed: false,
          borderColor: "",
          stripedColumns: false,
          responsive: true,
        },
        children: [
          {
            id: tplId("trow-1"),
            type: "table-row",
            label: "Row 1",
            props: {},
            children: [
              { id: tplId("tcell-1-1"), type: "table-cell", label: "Cell", props: { text: "001" }, children: [] },
              { id: tplId("tcell-1-2"), type: "table-cell", label: "Cell", props: { text: "Marco Rossi" }, children: [] },
              { id: tplId("tcell-1-3"), type: "table-cell", label: "Cell", props: { text: "Piano Premium" }, children: [] },
              { id: tplId("tcell-1-4"), type: "table-cell", label: "Cell", props: { text: "€ 99,00" }, children: [] },
              { id: tplId("tcell-1-5"), type: "table-cell", label: "Cell", props: { text: "Completato" }, children: [] },
            ],
          },
          {
            id: tplId("trow-2"),
            type: "table-row",
            label: "Row 2",
            props: {},
            children: [
              { id: tplId("tcell-2-1"), type: "table-cell", label: "Cell", props: { text: "002" }, children: [] },
              { id: tplId("tcell-2-2"), type: "table-cell", label: "Cell", props: { text: "Giulia Bianchi" }, children: [] },
              { id: tplId("tcell-2-3"), type: "table-cell", label: "Cell", props: { text: "Piano Base" }, children: [] },
              { id: tplId("tcell-2-4"), type: "table-cell", label: "Cell", props: { text: "€ 49,00" }, children: [] },
              { id: tplId("tcell-2-5"), type: "table-cell", label: "Cell", props: { text: "In elaborazione" }, children: [] },
            ],
          },
          {
            id: tplId("trow-3"),
            type: "table-row",
            label: "Row 3",
            props: {},
            children: [
              { id: tplId("tcell-3-1"), type: "table-cell", label: "Cell", props: { text: "003" }, children: [] },
              { id: tplId("tcell-3-2"), type: "table-cell", label: "Cell", props: { text: "Luca Verdi" }, children: [] },
              { id: tplId("tcell-3-3"), type: "table-cell", label: "Cell", props: { text: "Piano Enterprise" }, children: [] },
              { id: tplId("tcell-3-4"), type: "table-cell", label: "Cell", props: { text: "€ 199,00" }, children: [] },
              { id: tplId("tcell-3-5"), type: "table-cell", label: "Cell", props: { text: "Completato" }, children: [] },
            ],
          },
          {
            id: tplId("trow-4"),
            type: "table-row",
            label: "Row 4",
            props: {},
            children: [
              { id: tplId("tcell-4-1"), type: "table-cell", label: "Cell", props: { text: "004" }, children: [] },
              { id: tplId("tcell-4-2"), type: "table-cell", label: "Cell", props: { text: "Anna Neri" }, children: [] },
              { id: tplId("tcell-4-3"), type: "table-cell", label: "Cell", props: { text: "Piano Premium" }, children: [] },
              { id: tplId("tcell-4-4"), type: "table-cell", label: "Cell", props: { text: "€ 99,00" }, children: [] },
              { id: tplId("tcell-4-5"), type: "table-cell", label: "Cell", props: { text: "In attesa" }, children: [] },
            ],
          },
          {
            id: tplId("trow-5"),
            type: "table-row",
            label: "Row 5",
            props: {},
            children: [
              { id: tplId("tcell-5-1"), type: "table-cell", label: "Cell", props: { text: "005" }, children: [] },
              { id: tplId("tcell-5-2"), type: "table-cell", label: "Cell", props: { text: "Paolo Russo" }, children: [] },
              { id: tplId("tcell-5-3"), type: "table-cell", label: "Cell", props: { text: "Piano Base" }, children: [] },
              { id: tplId("tcell-5-4"), type: "table-cell", label: "Cell", props: { text: "€ 49,00" }, children: [] },
              { id: tplId("tcell-5-5"), type: "table-cell", label: "Cell", props: { text: "Completato" }, children: [] },
            ],
          },
        ],
      },
    ],
  },
];

// ────────────────────────────────────────────────
// TEMPLATE 4: Pricing Page
// ────────────────────────────────────────────────
const pricingTemplate: CanvasComponent[] = [
  // Header
  {
    id: tplId("container"),
    type: "container",
    label: "Container",
    props: { fluid: "fluid", bgColor: "primary", padding: "5", textColor: "white", textAlign: "center" },
    children: [
      {
        id: tplId("heading"),
        type: "heading",
        label: "Heading",
        props: { text: "Scegli il Piano Perfetto", level: "1", displayClass: "3", textColor: "", textAlign: "center", textClass: "" },
      },
      {
        id: tplId("paragraph"),
        type: "paragraph",
        label: "Paragraph",
        props: { text: "Piani flessibili per ogni esigenza. Inizia gratis e scala quando vuoi.", lead: true, textColor: "", textAlign: "center", textSize: "lead" },
      },
    ],
  },
  // Pricing cards row
  {
    id: tplId("container"),
    type: "container",
    label: "Container",
    props: { fluid: "fixed", bgColor: "transparent", padding: "5", textColor: "dark", textAlign: "start" },
    children: [
      makeRow(3, [
        // Free plan
        [
          {
            id: tplId("card"),
            type: "card",
            label: "Card",
            props: { header: "Gratis", title: "€ 0", subtitle: "/mese", text: "Perfetto per iniziare", footer: "", imgSrc: "", variant: "", borderColor: "", textAlign: "center" },
            children: [
              {
                id: tplId("list"),
                type: "list",
                label: "Feature List",
                props: { items: "1 Progetto\n5 GB Spazio\nSupporto Email\nAccesso Base", listType: "unstyled", textColor: "" },
              },
              {
                id: tplId("btn"),
                type: "button",
                label: "Button",
                props: { text: "Inizia Gratis", variant: "outline-primary", outline: true, size: "lg", disabled: false, block: true, iconLeft: "" },
              },
            ],
          },
        ],
        // Pro plan
        [
          {
            id: tplId("card"),
            type: "card",
            label: "Card",
            props: { header: "Pro", title: "€ 29", subtitle: "/mese", text: "Per team in crescita", footer: "", imgSrc: "", variant: "primary", borderColor: "", textAlign: "center" },
            children: [
              {
                id: tplId("list"),
                type: "list",
                label: "Feature List",
                props: { items: "10 Progetti\n50 GB Spazio\nSupporto Prioritario\nAccesso Completo\nAPI Access", listType: "unstyled", textColor: "" },
              },
              {
                id: tplId("btn"),
                type: "button",
                label: "Button",
                props: { text: "Scegli Pro", variant: "primary", outline: false, size: "lg", disabled: false, block: true, iconLeft: "" },
              },
            ],
          },
        ],
        // Enterprise plan
        [
          {
            id: tplId("card"),
            type: "card",
            label: "Card",
            props: { header: "Enterprise", title: "€ 99", subtitle: "/mese", text: "Per grandi organizzazioni", footer: "", imgSrc: "", variant: "dark", borderColor: "", textAlign: "center" },
            children: [
              {
                id: tplId("list"),
                type: "list",
                label: "Feature List",
                props: { items: "Progetti Illimitati\nSpazio Illimitato\nSupporto 24/7\nAccesso Completo\nAPI Access\nSLA Garantito", listType: "unstyled", textColor: "" },
              },
              {
                id: tplId("btn"),
                type: "button",
                label: "Button",
                props: { text: "Contattaci", variant: "outline-light", outline: true, size: "lg", disabled: false, block: true, iconLeft: "" },
              },
            ],
          },
        ],
      ]),
    ],
  },
];

// ────────────────────────────────────────────────
// TEMPLATE 5: Blog Post
// ────────────────────────────────────────────────
const blogTemplate: CanvasComponent[] = [
  // Navbar
  {
    id: tplId("navbar"),
    type: "navbar",
    label: "Navbar",
    props: { brand: "Il Mio Blog", items: "Home, Articoli, Categorie, Chi Siamo", variant: "light", expand: "lg", bgColor: "white", container: "fluid" },
  },
  // Hero image
  {
    id: tplId("container"),
    type: "container",
    label: "Container",
    props: { fluid: "fixed", bgColor: "transparent", padding: "5", textColor: "dark", textAlign: "start" },
    children: [
      {
        id: tplId("image"),
        type: "image",
        label: "Hero Image",
        props: { src: "https://picsum.photos/seed/blog-hero/1200/400", alt: "Immagine copertina articolo", fluid: true, rounded: false, alignment: "center" },
      },
      {
        id: tplId("heading"),
        type: "heading",
        label: "Heading",
        props: { text: "Come Costruire Applicazioni Web Moderne", level: "1", displayClass: "4", textColor: "", textAlign: "start", textClass: "" },
      },
      // Author info row
      makeRow(2, [
        [
          {
            id: tplId("paragraph"),
            type: "paragraph",
            label: "Author",
            props: { text: "Di Marco Rossi · 15 Marzo 2025 · 8 min lettura", lead: false, textColor: "muted", textAlign: "start", textSize: "fs-6" },
          },
        ],
        [
          {
            id: tplId("paragraph"),
            type: "paragraph",
            label: "Category",
            props: { text: "Sviluppo Web", lead: false, textColor: "primary", textAlign: "end", textSize: "fs-6" },
          },
        ],
      ]),
      {
        id: tplId("divider"),
        type: "divider",
        label: "Divider",
        props: { borderColor: "", margin: "3" },
      },
    ],
  },
  // Content with sidebar
  {
    id: tplId("container"),
    type: "container",
    label: "Container",
    props: { fluid: "fixed", bgColor: "transparent", padding: "4", textColor: "dark", textAlign: "start" },
    children: [
      {
        id: tplId("row"),
        type: "row",
        label: "Row",
        props: { cols: "2", gutter: "4", verticalAlign: "start" },
        children: [
          // Main content col
          {
            id: tplId("col"),
            type: "col",
            label: "Column",
            props: { size: "8", bgColor: "transparent", textColor: "dark", padding: "3", textAlign: "start" },
            children: [
              {
                id: tplId("heading"),
                type: "heading",
                label: "Heading",
                props: { text: "Introduzione", level: "2", displayClass: "", textColor: "", textAlign: "start", textClass: "" },
              },
              {
                id: tplId("paragraph"),
                type: "paragraph",
                label: "Paragraph",
                props: { text: "Lo sviluppo web moderno richiede una comprensione profonda di framework, strumenti e best practice. In questo articolo esploreremo le tecniche fondamentali per creare applicazioni robuste e scalabili.", lead: false, textColor: "", textAlign: "start", textSize: "" },
              },
              {
                id: tplId("heading"),
                type: "heading",
                label: "Heading",
                props: { text: "I Fondamenti", level: "2", displayClass: "", textColor: "", textAlign: "start", textClass: "" },
              },
              {
                id: tplId("paragraph"),
                type: "paragraph",
                label: "Paragraph",
                props: { text: "Prima di immergerci nei dettagli tecnici, è importante comprendere i principi base che guidano lo sviluppo web moderno: responsività, accessibilità e performance.", lead: false, textColor: "", textAlign: "start", textSize: "" },
              },
              {
                id: tplId("blockquote"),
                type: "blockquote",
                label: "Blockquote",
                props: { text: "Il miglior codice è quello che non devi scrivere. Ma quando devi scrivere, rendilo pulito e leggibile.", attribution: "Un Saggio Programmatore", borderColor: "primary", alignment: "start" },
              },
            ],
          },
          // Sidebar col
          {
            id: tplId("col"),
            type: "col",
            label: "Column",
            props: { size: "4", bgColor: "light", textColor: "dark", padding: "3", textAlign: "start" },
            children: [
              {
                id: tplId("heading"),
                type: "heading",
                label: "Heading",
                props: { text: "Articoli Correlati", level: "5", displayClass: "", textColor: "", textAlign: "start", textClass: "" },
              },
              {
                id: tplId("list-group"),
                type: "list-group",
                label: "List Group",
                props: { items: "Guida a React 2025\nTypeScript Best Practices\nCSS Grid Layout\nAPI REST con Node.js", flush: true, numbered: false, action: true, activeIndex: 0, hoverIndex: 2 },
              },
              {
                id: tplId("divider"),
                type: "divider",
                label: "Divider",
                props: { borderColor: "", margin: "3" },
              },
              {
                id: tplId("heading"),
                type: "heading",
                label: "Heading",
                props: { text: "Tag", level: "5", displayClass: "", textColor: "", textAlign: "start", textClass: "" },
              },
              {
                id: tplId("badge"),
                type: "badge",
                label: "Badge",
                props: { text: "JavaScript", variant: "primary", pill: true },
              },
              {
                id: tplId("badge"),
                type: "badge",
                label: "Badge",
                props: { text: "React", variant: "info", pill: true },
              },
              {
                id: tplId("badge"),
                type: "badge",
                label: "Badge",
                props: { text: "CSS", variant: "success", pill: true },
              },
            ],
          },
        ],
      },
    ],
  },
];

// ────────────────────────────────────────────────
// TEMPLATE 6: Portfolio / Gallery
// ────────────────────────────────────────────────
const portfolioTemplate: CanvasComponent[] = [
  // Header
  {
    id: tplId("container"),
    type: "container",
    label: "Container",
    props: { fluid: "fixed", bgColor: "transparent", padding: "5", textColor: "dark", textAlign: "center" },
    children: [
      {
        id: tplId("heading"),
        type: "heading",
        label: "Heading",
        props: { text: "Il Nostro Portfolio", level: "1", displayClass: "3", textColor: "", textAlign: "center", textClass: "" },
      },
      {
        id: tplId("paragraph"),
        type: "paragraph",
        label: "Paragraph",
        props: { text: "Una selezione dei nostri migliori lavori e progetti creativi.", lead: true, textColor: "muted", textAlign: "center", textSize: "lead" },
      },
    ],
  },
  // Gallery grid
  {
    id: tplId("container"),
    type: "container",
    label: "Container",
    props: { fluid: "fixed", bgColor: "transparent", padding: "4", textColor: "dark", textAlign: "start" },
    children: [
      makeRow(3, [
        [
          {
            id: tplId("card"),
            type: "card",
            label: "Card",
            props: { header: "", title: "App E-commerce", subtitle: "Sviluppo Web", text: "Piattaforma e-commerce completa con pagamenti integrati.", footer: "", imgSrc: "https://picsum.photos/seed/portfolio1/400/250", variant: "", borderColor: "", textAlign: "start" },
          },
        ],
        [
          {
            id: tplId("card"),
            type: "card",
            label: "Card",
            props: { header: "", title: "Dashboard Analytics", subtitle: "UI/UX Design", text: "Dashboard interattiva per la visualizzazione dati in tempo reale.", footer: "", imgSrc: "https://picsum.photos/seed/portfolio2/400/250", variant: "", borderColor: "", textAlign: "start" },
          },
        ],
        [
          {
            id: tplId("card"),
            type: "card",
            label: "Card",
            props: { header: "", title: "App Mobile", subtitle: "Mobile Development", text: "Applicazione mobile cross-platform per iOS e Android.", footer: "", imgSrc: "https://picsum.photos/seed/portfolio3/400/250", variant: "", borderColor: "", textAlign: "start" },
          },
        ],
      ]),
      makeRow(3, [
        [
          {
            id: tplId("card"),
            type: "card",
            label: "Card",
            props: { header: "", title: "Brand Identity", subtitle: "Graphic Design", text: "Identità visiva completa per startup tecnologiche.", footer: "", imgSrc: "https://picsum.photos/seed/portfolio4/400/250", variant: "", borderColor: "", textAlign: "start" },
          },
        ],
        [
          {
            id: tplId("card"),
            type: "card",
            label: "Card",
            props: { header: "", title: "Sito Corporate", subtitle: "Web Design", text: "Sito web istituzionale responsive con CMS personalizzato.", footer: "", imgSrc: "https://picsum.photos/seed/portfolio5/400/250", variant: "", borderColor: "", textAlign: "start" },
          },
        ],
        [
          {
            id: tplId("card"),
            type: "card",
            label: "Card",
            props: { header: "", title: "Piattaforma SaaS", subtitle: "Full Stack", text: "Piattaforma software-as-a-service con architettura cloud.", footer: "", imgSrc: "https://picsum.photos/seed/portfolio6/400/250", variant: "", borderColor: "", textAlign: "start" },
          },
        ],
      ]),
    ],
  },
];

// ────────────────────────────────────────────────
// TEMPLATE 7: Contact Page
// ────────────────────────────────────────────────
const contactTemplate: CanvasComponent[] = [
  // Header
  {
    id: tplId("container"),
    type: "container",
    label: "Container",
    props: { fluid: "fluid", bgColor: "dark", padding: "5", textColor: "white", textAlign: "center" },
    children: [
      {
        id: tplId("heading"),
        type: "heading",
        label: "Heading",
        props: { text: "Contattaci", level: "1", displayClass: "3", textColor: "", textAlign: "center", textClass: "" },
      },
      {
        id: tplId("paragraph"),
        type: "paragraph",
        label: "Paragraph",
        props: { text: "Siamo qui per aiutarti. Compila il form e ti risponderemo entro 24 ore.", lead: true, textColor: "", textAlign: "center", textSize: "lead" },
      },
    ],
  },
  // Form + info
  {
    id: tplId("container"),
    type: "container",
    label: "Container",
    props: { fluid: "fixed", bgColor: "transparent", padding: "5", textColor: "dark", textAlign: "start" },
    children: [
      {
        id: tplId("row"),
        type: "row",
        label: "Row",
        props: { cols: "2", gutter: "4", verticalAlign: "start" },
        children: [
          // Contact form col
          makeCol("7", [
            {
              id: tplId("card"),
              type: "card",
              label: "Card",
              props: { header: "Invia un Messaggio", title: "", subtitle: "", text: "", footer: "", imgSrc: "", variant: "", borderColor: "", textAlign: "start" },
              children: [
                {
                  id: tplId("input-name"),
                  type: "input",
                  label: "Input",
                  props: { label: "Nome Completo", type: "text", placeholder: "Il tuo nome", helpText: "", size: "", disabled: false, readonly: false, required: true, floating: false, plaintext: false },
                },
                {
                  id: tplId("input-email"),
                  type: "input",
                  label: "Input",
                  props: { label: "Indirizzo Email", type: "email", placeholder: "nome@esempio.it", helpText: "", size: "", disabled: false, readonly: false, required: true, floating: false, plaintext: false },
                },
                {
                  id: tplId("textarea"),
                  type: "textarea",
                  label: "Textarea",
                  props: { label: "Messaggio", text: "", placeholder: "Scrivi il tuo messaggio...", rows: 5, helpText: "", size: "", disabled: false },
                },
                {
                  id: tplId("btn-submit"),
                  type: "button",
                  label: "Button",
                  props: { text: "Invia Messaggio", variant: "primary", outline: false, size: "lg", disabled: false, block: true, iconLeft: "" },
                },
              ],
            },
          ]),
          // Info panel col
          makeCol("5", [
            {
              id: tplId("card"),
              type: "card",
              label: "Card",
              props: { header: "Informazioni", title: "", subtitle: "", text: "", footer: "", imgSrc: "", variant: "light", borderColor: "", textAlign: "start" },
              children: [
                {
                  id: tplId("heading"),
                  type: "heading",
                  label: "Heading",
                  props: { text: "Sede Centrale", level: "5", displayClass: "", textColor: "", textAlign: "start", textClass: "" },
                },
                {
                  id: tplId("paragraph"),
                  type: "paragraph",
                  label: "Paragraph",
                  props: { text: "Via Roma 123, 20121 Milano MI", lead: false, textColor: "muted", textAlign: "start", textSize: "fs-6" },
                },
                {
                  id: tplId("divider"),
                  type: "divider",
                  label: "Divider",
                  props: { borderColor: "", margin: "3" },
                },
                {
                  id: tplId("heading"),
                  type: "heading",
                  label: "Heading",
                  props: { text: "Email", level: "5", displayClass: "", textColor: "", textAlign: "start", textClass: "" },
                },
                {
                  id: tplId("paragraph"),
                  type: "paragraph",
                  label: "Paragraph",
                  props: { text: "info@aziendaitalia.it", lead: false, textColor: "primary", textAlign: "start", textSize: "fs-6" },
                },
                {
                  id: tplId("divider"),
                  type: "divider",
                  label: "Divider",
                  props: { borderColor: "", margin: "3" },
                },
                {
                  id: tplId("heading"),
                  type: "heading",
                  label: "Heading",
                  props: { text: "Telefono", level: "5", displayClass: "", textColor: "", textAlign: "start", textClass: "" },
                },
                {
                  id: tplId("paragraph"),
                  type: "paragraph",
                  label: "Paragraph",
                  props: { text: "+39 02 1234 5678", lead: false, textColor: "muted", textAlign: "start", textSize: "fs-6" },
                },
                {
                  id: tplId("divider"),
                  type: "divider",
                  label: "Divider",
                  props: { borderColor: "", margin: "3" },
                },
                {
                  id: tplId("heading"),
                  type: "heading",
                  label: "Heading",
                  props: { text: "Orari", level: "5", displayClass: "", textColor: "", textAlign: "start", textClass: "" },
                },
                {
                  id: tplId("paragraph"),
                  type: "paragraph",
                  label: "Paragraph",
                  props: { text: "Lun-Ven: 9:00 - 18:00\nSab: 10:00 - 14:00", lead: false, textColor: "muted", textAlign: "start", textSize: "fs-6" },
                },
              ],
            },
          ]),
        ],
      },
    ],
  },
];

// ────────────────────────────────────────────────
// TEMPLATE 8: 404 Error Page
// ────────────────────────────────────────────────
const error404Template: CanvasComponent[] = [
  {
    id: tplId("container"),
    type: "container",
    label: "Container",
    props: { fluid: "fixed", bgColor: "transparent", padding: "5", textColor: "dark", textAlign: "center" },
    children: [
      {
        id: tplId("spacer"),
        type: "spacer",
        label: "Spacer",
        props: { height: "5" },
      },
      {
        id: tplId("heading"),
        type: "heading",
        label: "Heading",
        props: { text: "404", level: "1", displayClass: "1", textColor: "primary", textAlign: "center", textClass: "" },
      },
      {
        id: tplId("heading"),
        type: "heading",
        label: "Heading",
        props: { text: "Oops! Pagina Non Trovata", level: "3", displayClass: "", textColor: "muted", textAlign: "center", textClass: "" },
      },
      {
        id: tplId("paragraph"),
        type: "paragraph",
        label: "Paragraph",
        props: { text: "La pagina che stai cercando potrebbe essere stata rimossa, aver cambiato nome o essere temporaneamente non disponibile.", lead: false, textColor: "muted", textAlign: "center", textSize: "lead" },
      },
      {
        id: tplId("image"),
        type: "image",
        label: "Illustration",
        props: { src: "https://picsum.photos/seed/404-error/600/300", alt: "Illustrazione errore 404", fluid: true, rounded: true, alignment: "center" },
      },
      {
        id: tplId("btn"),
        type: "button",
        label: "Button",
        props: { text: "Torna alla Home", variant: "primary", outline: false, size: "lg", disabled: false, block: false, iconLeft: "house" },
      },
      {
        id: tplId("spacer"),
        type: "spacer",
        label: "Spacer",
        props: { height: "5" },
      },
    ],
  },
];

// ────────────────────────────────────────────────
// TEMPLATE 9: FAQ Page
// ────────────────────────────────────────────────
const faqTemplate: CanvasComponent[] = [
  // Header
  {
    id: tplId("container"),
    type: "container",
    label: "Container",
    props: { fluid: "fluid", bgColor: "light", padding: "5", textColor: "dark", textAlign: "center" },
    children: [
      {
        id: tplId("heading"),
        type: "heading",
        label: "Heading",
        props: { text: "Domande Frequenti", level: "1", displayClass: "3", textColor: "", textAlign: "center", textClass: "" },
      },
      {
        id: tplId("paragraph"),
        type: "paragraph",
        label: "Paragraph",
        props: { text: "Trova risposte alle domande più comuni sul nostro servizio.", lead: true, textColor: "muted", textAlign: "center", textSize: "lead" },
      },
      {
        id: tplId("input"),
        type: "input",
        label: "Search",
        props: { label: "", type: "search", placeholder: "Cerca una domanda...", helpText: "", size: "lg", disabled: false, readonly: false, required: false, floating: false, plaintext: false },
      },
    ],
  },
  // FAQ Accordion
  {
    id: tplId("container"),
    type: "container",
    label: "Container",
    props: { fluid: "fixed", bgColor: "transparent", padding: "5", textColor: "dark", textAlign: "start" },
    children: [
      {
        id: tplId("accordion"),
        type: "accordion",
        label: "Accordion",
        props: { items: "Come posso creare un account?\nPer creare un account, clicca su Registrati nella homepage e compila il form con i tuoi dati. Riceverai un'email di conferma.", flush: false, alwaysOpen: false, borderColor: "" },
      },
      {
        id: tplId("accordion"),
        type: "accordion",
        label: "Accordion",
        props: { items: "Quali metodi di pagamento accettate?\nAccettiamo carte di credito (Visa, Mastercard), PayPal, bonifico bancario e contrassegno.", flush: false, alwaysOpen: false, borderColor: "" },
      },
      {
        id: tplId("accordion"),
        type: "accordion",
        label: "Accordion",
        props: { items: "Come posso annullare un abbonamento?\nPuoi annullare il tuo abbonamento in qualsiasi momento dalla sezione Impostazioni del tuo account. L'annullamento sarà effettivo alla fine del periodo in corso.", flush: false, alwaysOpen: false, borderColor: "" },
      },
      {
        id: tplId("accordion"),
        type: "accordion",
        label: "Accordion",
        props: { items: "Offrite supporto tecnico?\nSì, offriamo supporto via email 24/7 e supporto telefonico negli orari d'ufficio per i piani Pro e Enterprise.", flush: false, alwaysOpen: false, borderColor: "" },
      },
      {
        id: tplId("accordion"),
        type: "accordion",
        label: "Accordion",
        props: { items: "I miei dati sono sicuri?\nAssolutamente sì. Utilizziamo crittografia SSL, backup giornalieri e conformità GDPR per proteggere i tuoi dati.", flush: false, alwaysOpen: false, borderColor: "" },
      },
    ],
  },
  // CTA
  {
    id: tplId("container"),
    type: "container",
    label: "Container",
    props: { fluid: "fluid", bgColor: "primary", padding: "4", textColor: "white", textAlign: "center" },
    children: [
      {
        id: tplId("heading"),
        type: "heading",
        label: "Heading",
        props: { text: "Non hai trovato la risposta?", level: "4", displayClass: "", textColor: "", textAlign: "center", textClass: "" },
      },
      {
        id: tplId("button"),
        type: "button",
        label: "Button",
        props: { text: "Contattaci", variant: "light", outline: false, size: "lg", disabled: false, block: false, iconLeft: "" },
      },
    ],
  },
];

// ────────────────────────────────────────────────
// TEMPLATE 10: Team Page
// ────────────────────────────────────────────────
const teamTemplate: CanvasComponent[] = [
  // Header
  {
    id: tplId("container"),
    type: "container",
    label: "Container",
    props: { fluid: "fixed", bgColor: "transparent", padding: "5", textColor: "dark", textAlign: "center" },
    children: [
      {
        id: tplId("heading"),
        type: "heading",
        label: "Heading",
        props: { text: "Il Nostro Team", level: "1", displayClass: "3", textColor: "", textAlign: "center", textClass: "" },
      },
      {
        id: tplId("paragraph"),
        type: "paragraph",
        label: "Paragraph",
        props: { text: "Professionisti appassionati che trasformano le idee in realtà digitali.", lead: true, textColor: "muted", textAlign: "center", textSize: "lead" },
      },
    ],
  },
  // Team grid
  {
    id: tplId("container"),
    type: "container",
    label: "Container",
    props: { fluid: "fixed", bgColor: "transparent", padding: "4", textColor: "dark", textAlign: "start" },
    children: [
      makeRow(4, [
        [
          {
            id: tplId("card"),
            type: "card",
            label: "Card",
            props: { header: "", title: "Marco Rossi", subtitle: "CEO & Fondatore", text: "Visionario leader con 15 anni di esperienza nel settore tech.", footer: "", imgSrc: "https://picsum.photos/seed/team1/300/300", variant: "", borderColor: "", textAlign: "center" },
          },
        ],
        [
          {
            id: tplId("card"),
            type: "card",
            label: "Card",
            props: { header: "", title: "Giulia Bianchi", subtitle: "CTO", text: "Esperta di architetture cloud e sviluppo full-stack.", footer: "", imgSrc: "https://picsum.photos/seed/team2/300/300", variant: "", borderColor: "", textAlign: "center" },
          },
        ],
        [
          {
            id: tplId("card"),
            type: "card",
            label: "Card",
            props: { header: "", title: "Luca Verdi", subtitle: "Lead Designer", text: "Creativo con un occhio per i dettagli e l'esperienza utente.", footer: "", imgSrc: "https://picsum.photos/seed/team3/300/300", variant: "", borderColor: "", textAlign: "center" },
          },
        ],
        [
          {
            id: tplId("card"),
            type: "card",
            label: "Card",
            props: { header: "", title: "Anna Neri", subtitle: "Marketing Director", text: "Stratega digitale specializzata in crescita e acquisizione.", footer: "", imgSrc: "https://picsum.photos/seed/team4/300/300", variant: "", borderColor: "", textAlign: "center" },
          },
        ],
      ]),
      makeRow(4, [
        [
          {
            id: tplId("card"),
            type: "card",
            label: "Card",
            props: { header: "", title: "Paolo Russo", subtitle: "Backend Developer", text: "Sviluppatore esperto in API e microservizi scalabili.", footer: "", imgSrc: "https://picsum.photos/seed/team5/300/300", variant: "", borderColor: "", textAlign: "center" },
          },
        ],
        [
          {
            id: tplId("card"),
            type: "card",
            label: "Card",
            props: { header: "", title: "Sara Conti", subtitle: "Frontend Developer", text: "Appassionata di interfacce responsive e accessibilità.", footer: "", imgSrc: "https://picsum.photos/seed/team6/300/300", variant: "", borderColor: "", textAlign: "center" },
          },
        ],
        [
          {
            id: tplId("card"),
            type: "card",
            label: "Card",
            props: { header: "", title: "Roberto Ferrara", subtitle: "Data Analyst", text: "Esperto in analisi dati e business intelligence.", footer: "", imgSrc: "https://picsum.photos/seed/team7/300/300", variant: "", borderColor: "", textAlign: "center" },
          },
        ],
        [
          {
            id: tplId("card"),
            type: "card",
            label: "Card",
            props: { header: "", title: "Elena Marchetti", subtitle: "HR Manager", text: "Gestisce il team con empatia e professionalità.", footer: "", imgSrc: "https://picsum.photos/seed/team8/300/300", variant: "", borderColor: "", textAlign: "center" },
          },
        ],
      ]),
    ],
  },
];

// ────────────────────────────────────────────────
// TEMPLATE 11: Footer
// ────────────────────────────────────────────────
const footerTemplate: CanvasComponent[] = [
  {
    id: tplId("container"),
    type: "container",
    label: "Container",
    props: { fluid: "fluid", bgColor: "dark", padding: "5", textColor: "white", textAlign: "start" },
    children: [
      {
        id: tplId("row"),
        type: "row",
        label: "Row",
        props: { cols: "4", gutter: "4", verticalAlign: "start" },
        children: [
          // Brand col
          makeCol("3", [
            {
              id: tplId("heading"),
              type: "heading",
              label: "Heading",
              props: { text: "AziendaItalia", level: "4", displayClass: "", textColor: "white", textAlign: "start", textClass: "" },
            },
            {
              id: tplId("paragraph"),
              type: "paragraph",
              label: "Paragraph",
              props: { text: "Soluzioni digitali innovative per la tua azienda. Trasformiamo le idee in prodotti straordinari.", lead: false, textColor: "muted", textAlign: "start", textSize: "fs-6" },
            },
          ]),
          // Links col 1
          makeCol("3", [
            {
              id: tplId("heading"),
              type: "heading",
              label: "Heading",
              props: { text: "Servizi", level: "6", displayClass: "", textColor: "white", textAlign: "start", textClass: "text-uppercase" },
            },
            {
              id: tplId("list"),
              type: "list",
              label: "List",
              props: { items: "Sviluppo Web\nDesign UI/UX\nConsulenza\nMarketing Digitale", listType: "unstyled", textColor: "muted" },
            },
          ]),
          // Links col 2
          makeCol("3", [
            {
              id: tplId("heading"),
              type: "heading",
              label: "Heading",
              props: { text: "Azienda", level: "6", displayClass: "", textColor: "white", textAlign: "start", textClass: "text-uppercase" },
            },
            {
              id: tplId("list"),
              type: "list",
              label: "List",
              props: { items: "Chi Siamo\nIl Nostro Team\nBlog\nCarriere", listType: "unstyled", textColor: "muted" },
            },
          ]),
          // Contact col
          makeCol("3", [
            {
              id: tplId("heading"),
              type: "heading",
              label: "Heading",
              props: { text: "Contatti", level: "6", displayClass: "", textColor: "white", textAlign: "start", textClass: "text-uppercase" },
            },
            {
              id: tplId("list"),
              type: "list",
              label: "List",
              props: { items: "info@aziendaitalia.it\n+39 02 1234 5678\nVia Roma 123, Milano", listType: "unstyled", textColor: "muted" },
            },
          ]),
        ],
      },
      {
        id: tplId("divider"),
        type: "divider",
        label: "Divider",
        props: { borderColor: "secondary", margin: "3" },
      },
      // Bottom row
      {
        id: tplId("row"),
        type: "row",
        label: "Row",
        props: { cols: "2", gutter: "3", verticalAlign: "center" },
        children: [
          makeCol("6", [
            {
              id: tplId("paragraph"),
              type: "paragraph",
              label: "Copyright",
              props: { text: "© 2025 AziendaItalia. Tutti i diritti riservati.", lead: false, textColor: "muted", textAlign: "start", textSize: "fs-6" },
            },
          ]),
          makeCol("6", [
            {
              id: tplId("paragraph"),
              type: "paragraph",
              label: "Social",
              props: { text: "Twitter  ·  LinkedIn  ·  GitHub  ·  Instagram", lead: false, textColor: "muted", textAlign: "end", textSize: "fs-6" },
            },
          ]),
        ],
      },
    ],
  },
];

// ── Export all templates ──
export const TEMPLATES: TemplateDefinition[] = [
  {
    id: "landing",
    label: "Landing Page",
    icon: LayoutTemplate,
    description: "Pagina di destinazione con hero e schede servizi",
    components: landingTemplate,
  },
  {
    id: "login",
    label: "Login",
    icon: LogIn,
    description: "Form di accesso centrato con email e password",
    components: loginTemplate,
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Pannello di controllo con statistiche e tabella dati",
    components: dashboardTemplate,
  },
  {
    id: "pricing",
    label: "Pricing",
    icon: DollarSign,
    description: "Pagina prezzi con 3 colonne di piani e CTA",
    components: pricingTemplate,
  },
  {
    id: "blog",
    label: "Blog Post",
    icon: FileText,
    description: "Articolo con hero, contenuto e sidebar",
    components: blogTemplate,
  },
  {
    id: "portfolio",
    label: "Portfolio",
    icon: Images,
    description: "Galleria di progetti con griglia di card",
    components: portfolioTemplate,
  },
  {
    id: "contact",
    label: "Contact",
    icon: Mail,
    description: "Pagina contatti con form e pannello informazioni",
    components: contactTemplate,
  },
  {
    id: "404",
    label: "404 Error",
    icon: AlertTriangle,
    description: "Pagina errore con messaggio e pulsante Home",
    components: error404Template,
  },
  {
    id: "faq",
    label: "FAQ",
    icon: HelpCircle,
    description: "Domande frequenti con accordion e ricerca",
    components: faqTemplate,
  },
  {
    id: "team",
    label: "Team",
    icon: Users,
    description: "Griglia dei membri del team con foto e ruoli",
    components: teamTemplate,
  },
  {
    id: "footer",
    label: "Footer",
    icon: FooterIcon,
    description: "Footer multi-colonna con link e copyright",
    components: footerTemplate,
  },
];
