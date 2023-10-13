module.exports = {
  UNAUTHORIZED: () => "Unauthorized access, provide the token",
  NOT_VALID: (entity) => `${entity} is not valid!`,
  NOT_FOUND: (entity, id) => `${entity} with id ${id} not found!`,
  ALREADY_EXISTS: (entity, field) => `${entity} with ${field} already exists!`,
};
