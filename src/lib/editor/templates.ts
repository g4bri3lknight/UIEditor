// Bootstrap GUI Editor - Pre-built Page Templates
import type { CanvasComponent } from "./types";
import { LayoutTemplate, LogIn, LayoutDashboard } from "lucide-react";
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
];
