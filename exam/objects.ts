export function construct_object(keys: string[], values: any[]) : {} | Record<string, any> {
  if (keys.length !== values.length) {
    return {};
  }
  const result = {};
  for (let i = 0; i < keys.length; i++) {
    result[keys[i]] = values[i];
  }
  return result;
}
