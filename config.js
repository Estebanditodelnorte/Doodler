window.POLL_CONFIG = {
  // Laissez vide pour desactiver le code d'acces.
  accessCode: "",

  // Remplacez ces valeurs avec votre projet Supabase.
  supabaseUrl: "https://YOUR_PROJECT.supabase.co",
  supabaseAnonKey: "YOUR_SUPABASE_ANON_KEY",

  // Nom de la table qui stocke les reponses.
  tableName: "poll_responses",

  // Si true, les participants voient les noms des autres repondants.
  // Si false, ils voient seulement les totaux agreges.
  showParticipantNames: true,
};
