import { Routes } from "@angular/router";

export const routes: Routes = [
    {
        path: "",
        loadComponent: () =>
            import("./components/pdf-extractor/pdf-extractor.component").then((m) => m.PdfExtractorComponent),
    },
    {
        path: "**",
        redirectTo: "",
    },
];
