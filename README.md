# Reservario
Moderní webová aplikace pro správu a rezervaci sportovních lekcí. Reservario poskytuje uživatelům plynulé prostředí pro prohlížení a rezervaci míst na lekcích a zároveň umožňuje instruktorům efektivně plánovat a spravovat své lekce. Aplikace je dostupná online na adrese: https://danielalv291.github.io/Reservario/

## Funkce
- Uživatelská autentizace: Bezpečné přihlášení a registrace uživatelů.
- Typy uživatelů: Aplikace podporuje dva typy uživatelů: běžné uživatele a instruktory.
- Předvytvořené účty:
 - Instruktor: Pro demonstrační účely je předvytvořen účet instruktora s uživatelským jménem instructor@email.cz a heslem instructor@email.cz.
 - Běžní uživatelé: Mohou se registrovat pomocí tlačítka. Také lze použít předvytvořené účty Jméno: user1@email.cz, Heslo: user1@email.cz; Jméno: user2@email.cz, Heslo: user2@email.cz
- Data o uživatelích a lekcích jsou ukládána do localStorage
- Dynamický kalendář lekcí: Interaktivní kalendář pro snadné procházení lekcí podle měsíců.
- Správa lekcí: (Pouze pro administrátory/instruktory) Vytváření, prohlížení, úprava a mazání lekcí.
- Detail lekce: Zobrazení podrobných informací o každé lekci.
- Responzivní design: Aplikace se přizpůsobuje různým velikostem obrazovky, od mobilních zařízení po desktopy.

## Některé body z hodnocení
- HTML grafika - použita pro logo
- HTML audio - použito pro přehrávání v sekci Podcasts
- HTML validace - minimální požadavky na vytvoření hesla
- JS knihovna - flatpicker pro výběr data a času
- Pokročilé JS API - local storage
- JS ovládání médií - přehrání zvuku při přhlášení na lekci
- JS SVG - použito pro šipky pro ovládání kalendáře
- Oproti zadání je použito méně stránek, protože to takhle považuji za přehlednější variantu