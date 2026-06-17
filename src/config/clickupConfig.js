export const CLICKUP_TEAM_ID = "9007136086";
export const CLICKUP_SPACE_ID = "90070311391";

// Nome da pasta que contém as listas de sprint dentro do space (ano atual)
export const CLICKUP_SPRINT_FOLDER_NAME = String(new Date().getFullYear());

// Prefixo do nome das listas de sprint no ClickUp (ex: "Sprint 6")
export const SPRINT_LIST_NAME_PREFIX = "Sprint";

// Nome do campo customizado de story points nas tasks
export const STORY_POINTS_FIELD_NAME = "points";

// Nome do campo customizado de cliente nas tasks
export const CLIENTE_FIELD_NAME = "Cliente";

// Statuses que indicam tarefa concluída (qualquer um desses conta como "done")
export const STATUSES_DONE = [
  "revisão backend",
  "revisão frontend",
  "revisado",
  "em homologação",
  "em produção",
];

// Status que indica tarefa em andamento
export const STATUS_IN_PROGRESS = "em desenvolvimento";

// Threshold (em pontos percentuais) para acionar alerta de lag
export const LAG_THRESHOLD = 15;

// sprintPoints: total de pontos do projeto por sprint (configurado estaticamente)
export const PROJECTS = [
  {
    name: "Brasil Júnior",
    clienteFieldValue: "Brasil Júnior",
    sprintPoints: 140,
  },
  { name: "EVNTTZ.", clienteFieldValue: "EVNTTZ.", sprintPoints: 100 },
  { name: "Migtech", clienteFieldValue: "MigTech", sprintPoints: 100 },
  { name: "Maestria", clienteFieldValue: "Maestria", sprintPoints: 40 },
  { name: "Vivalá", clienteFieldValue: "Vivalá", sprintPoints: 40 },
  { name: "SisOnVet", clienteFieldValue: "Sisonvet", sprintPoints: 60 },
];

export const DEVELOPERS = [
  { name: "Adelino", email: "adelinosegundo@gmail.com" },
  { name: "Douglas", email: "douglastrindadev@gmail.com" },
  { name: "Eliaquim", email: "eliaquimdossantos@gmail.com" },
  { name: "Henrique", email: "rick.vieira.almeida@gmail.com" },
  { name: "Luan", email: "luan@tootz.com.br" },
  { name: "Wendell", email: "wendellp.barreto@gmail.com" },
];
