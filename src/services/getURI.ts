export const BASE_URL = 'http://localhost:3000'; // Adjust port if necessary

export const ENTITIES = {
  AREAS: 'areas',
  USERS: 'users',
  PROFILES: 'profiles',
  USER_PROFILES: 'user-profiles',
  RULES: 'rules',
  PROFILE_RULES: 'profile-rules',
  COURTS: 'courts',
  COURT_DIVISIONS: 'court-divisions',
  STATUSES: 'status',
  STAGES: 'stages',
  OUTCOMES: 'outcomes',
  CAUSES: 'causes',
  CAUSE_USERS: 'cause-users',
};

export const getURI = (entity: string) => `${BASE_URL}/${entity}`;
