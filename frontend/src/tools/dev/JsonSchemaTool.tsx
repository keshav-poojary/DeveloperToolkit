import React, { useState } from 'react';

// Simple JSON Schema validation without external library
type SchemaError = { path: string; message: string };

const validateSchema = (data: unknown, schema: Record<string, unknown>, path = '#'): SchemaError[] => {
  const errors: SchemaError[] = [];
  const type = schema.type as string | undefined;

  if (type) {
    const actualType = data === null ? 'null' : Array.isArray(data) ? 'array' : typeof data;
    if (actualType !== type) {
      errors.push({ path, message: `Expected ${type}, got ${actualType}` });
      return errors;
    }
  }

  if (schema.required && typeof data === 'object' && data !== null && !Array.isArray(data)) {
    for (const req of schema.required as string[]) {
      if (!((data as Record<string, unknown>).hasOwnProperty(req))) {
        errors.push({ path, message: `Missing required property: "${req}"` });
      }
    }
  }

  if (schema.properties && typeof data === 'object' && data !== null && !Array.isArray(data)) {
    for (const [key, propSchema] of Object.entries(schema.properties as Record<string, unknown>)) {
      const val = (data as Record<string, unknown>)[key];
      if (val !== undefined) {
        errors.push(...validateSchema(val, propSchema as Record<string, unknown>, `${path}.${key}`));
      }
    }
  }

  if (schema.items && Array.isArray(data)) {
    data.forEach((item, i) => {
      errors.push(...validateSchema(item, schema.items as Record<string, unknown>, `${path}[${i}]`));
    });
  }

  if (typeof schema.minLength === 'number' && typeof data === 'string' && data.length < schema.minLength) {
    errors.push({ path, message: `String too short (min ${schema.minLength})` });
  }
  if (typeof schema.maxLength === 'number' && typeof data === 'string' && data.length > schema.maxLength) {
    errors.push({ path, message: `String too long (max ${schema.maxLength})` });
  }
  if (typeof schema.minimum === 'number' && typeof data === 'number' && data < schema.minimum) {
    errors.push({ path, message: `Value ${data} below minimum ${schema.minimum}` });
  }
  if (typeof schema.maximum === 'number' && typeof data === 'number' && data > schema.maximum) {
    errors.push({ path, message: `Value ${data} above maximum ${schema.maximum}` });
  }
  if (schema.enum && !(schema.enum as unknown[]).includes(data)) {
    errors.push({ path, message: `Value not in enum: ${JSON.stringify(schema.enum)}` });
  }

  return errors;
};

const EXAMPLE_SCHEMA = JSON.stringify({
  type: 'object',
  required: ['name', 'age', 'email'],
  properties: {
    name: { type: 'string', minLength: 1 },
    age: { type: 'number', minimum: 0, maximum: 150 },
    email: { type: 'string' },
    role: { type: 'string', enum: ['admin', 'user', 'guest'] },
  }
}, null, 2);

const EXAMPLE_DATA = JSON.stringify({ name: 'Alice', age: 28, email: 'alice@example.com', role: 'admin' }, null, 2);

const JsonSchemaTool: React.FC = () => {
  const [schema, setSchema] = useState(EXAMPLE_SCHEMA);
  const [data, setData] = useState(EXAMPLE_DATA);
  const [errors, setErrors] = useState<SchemaError[] | null>(null);
  const [parseError, setParseError] = useState('');

  const validate = () => {
    setParseError('');
    setErrors(null);
    try {
      const parsedSchema = JSON.parse(schema);
      const parsedData = JSON.parse(data);
      const result = validateSchema(parsedData, parsedSchema);
      setErrors(result);
    } catch (e: any) {
      setParseError(e.message);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">JSON Schema Validator</h1>
      <p className="text-gray-400 text-sm mb-5">Validate JSON data against a JSON Schema (Draft-07 subset).</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">JSON Schema</label>
          <textarea value={schema} onChange={e => setSchema(e.target.value)} rows={18}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm font-mono text-yellow-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">JSON Data</label>
          <textarea value={data} onChange={e => setData(e.target.value)} rows={18}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm font-mono text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y" />
        </div>
      </div>

      <button onClick={validate} className="mb-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">Validate</button>

      {parseError && <div className="p-3 bg-red-950/50 border border-red-900 rounded-lg text-red-400 text-sm mb-3">Parse error: {parseError}</div>}

      {errors !== null && (
        errors.length === 0
          ? <div className="p-4 bg-emerald-950/40 border border-emerald-900 rounded-xl text-emerald-400 font-medium text-sm">✅ Validation passed! Data matches the schema.</div>
          : (
            <div>
              <p className="text-sm text-red-400 mb-2">{errors.length} validation error{errors.length !== 1 ? 's' : ''}:</p>
              <div className="space-y-2">
                {errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-red-950/40 border border-red-900 rounded-xl">
                    <span className="font-mono text-xs text-red-400 flex-shrink-0">{e.path}</span>
                    <span className="text-xs text-red-300">{e.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )
      )}
    </div>
  );
};

export default JsonSchemaTool;
