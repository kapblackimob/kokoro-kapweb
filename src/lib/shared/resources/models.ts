export type Model = (typeof models)[number];
export type ModelId = Model["modelId"];

export const models = Object.freeze([
  {
    modelId: "model",
    quantization: "fp32",
    size: "326 MB",
  },
  {
    modelId: "model_fp16",
    quantization: "fp16",
    size: "163 MB",
  },
  {
    modelId: "model_quantized",
    quantization: "8-bit",
    size: "92.4 MB",
  },
  {
    modelId: "model_q8f16",
    quantization: "Mixed precision",
    size: "86 MB",
  },
  {
    modelId: "model_uint8",
    quantization: "8-bit & mixed precision",
    size: "177 MB",
  },
  {
    modelId: "model_uint8f16",
    quantization: "Mixed precision",
    size: "114 MB",
  },
  {
    modelId: "model_q4",
    quantization: "4-bit matmul",
    size: "305 MB",
  },
  {
    modelId: "model_q4f16",
    quantization: "4-bit matmul & fp16 weights",
    size: "154 MB",
  },
] as const);

export const modelsMap: Record<ModelId, Model> = Object.freeze(
  (() => {
    const map: Record<ModelId, Model> = {} as Record<ModelId, Model>;
    for (const model of models) {
      map[model.modelId] = model;
    }
    return map;
  })(),
);

export const modelsIds = Object.freeze(models.map((model) => model.modelId));
