# Mini Doodle prive

Petit sondage de dates statique, concu pour:

- tourner localement sur votre ordinateur;
- etre deploye gratuitement sur Netlify;
- utiliser un lien difficile a deviner;
- ajouter un code d'acces leger;
- collecter les reponses avec Netlify Forms;
- permettre une aggregation locale via export CSV.

## Mode avance type Doodle

Si vous voulez que les participants:

- choisissent plusieurs dates;
- voient les reponses des autres;
- voient les totaux en direct;

alors il faut un backend partage.

La version recommandee ici est:

- Netlify pour l'hebergement du site;
- Supabase pour stocker les reponses et les lire en direct.

### Fichiers ajoutes pour ce mode

- `config.example.js`
- `supabase-schema.sql`

### Etapes

1. Creez un projet Supabase gratuit.
2. Executez `supabase-schema.sql` dans l'editeur SQL.
3. Editez `config.js`.
4. Remplacez les valeurs Supabase par celles de votre projet.
5. Laissez `accessCode: ""` si vous ne voulez aucune protection.
6. Deployez le site.

Le site utilise automatiquement Supabase si `config.js` contient:

- `supabaseUrl`
- `supabaseAnonKey`
- `tableName`

Sinon, il restera en mode simple sans partage live.

## Structure

- `index.html`: page racine neutre
- `rendezvous-ia-loi25-c2f9m6/`: page du sondage
- `admin-revue-k7d3p1/`: page privee pour agreger un CSV d'export
- `thanks/`: page de confirmation
- `styles.css`: styles communs
- `app.js`: logique du sondage
- `admin.js`: logique de l'agregation CSV
- `netlify.toml`: configuration Netlify

## Utilisation locale

Option simple:

1. Ouvrir `rendezvous-ia-loi25-c2f9m6/index.html` dans un navigateur.
2. Entrer le code d'acces configure dans `app.js`.

Option recommandee:

1. Depuis ce dossier, lancer un petit serveur statique, par exemple:
   - `python3 -m http.server 4173`
2. Ouvrir:
   - `http://localhost:4173/rendezvous-ia-loi25-c2f9m6/`

## Deploiement Netlify

1. Creez un nouveau site Netlify a partir de ce dossier.
2. Parametres:
   - Build command: vide
   - Publish directory: `.`
3. Apres le premier deployement, ouvrez:
   - `/rendezvous-ia-loi25-c2f9m6/`
4. Les soumissions apparaissent dans:
   - `Forms` dans l'interface Netlify

## Code d'acces

Le code d'acces est defini dans `config.js`:

- `accessCode`

Si `accessCode` est vide, le sondage s'ouvre directement sans etape de deblocage.
Sinon, c'est un filtre leger pour limiter le partage large.

Si vous poussez ce projet sur GitHub:

1. changez `accessCode` avant publication si la valeur a deja ete partagee;
2. vous pouvez committer `config.js` avec la cle `anon` Supabase;
3. n'utilisez jamais une cle `service_role` Supabase dans le front-end.

La cle `anon` Supabase est faite pour le client public. La securite repose sur les politiques `RLS`.

## Changer les dates

Les dates sont centralisees dans `app.js`, dans la constante:

- `POLL_DATES`

## Voir les resultats

Sans backend, les participants ne voient pas les reponses globales en direct.

Pour faire votre synthese:

1. Exportez les reponses du formulaire depuis Netlify en CSV.
2. Ouvrez:
   - `/admin-revue-k7d3p1/`
3. Collez le CSV.
4. L'outil calcule le total des:
   - `Disponible`
   - `Possible`
   - `Indisponible`

En mode Supabase, les participants voient directement:

- les totaux par date;
- la liste des repondants, si vous laissez cette option active dans `config.js`.

## Limites

- Pas de calendrier individuel en direct comme Doodle.
- Pas d'authentification forte.
- Pas de base de donnees.

Pour un besoin simple et prive, c'est souvent suffisant.
