export const models = Object.freeze({
  model: {
    quantization: "fp32",
    size: "326 MB",
  },
  model_fp16: {
    quantization: "fp16",
    size: "163 MB",
  },
  model_quantized: {
    quantization: "8-bit",
    size: "92.4 MB",
  },
  model_q8f16: {
    quantization: "Mixed precision",
    size: "86 MB",
  },
  model_uint8: {
    quantization: "8-bit & mixed precision",
    size: "177 MB",
  },
  model_uint8f16: {
    quantization: "Mixed precision",
    size: "114 MB",
  },
  model_q4: {
    quantization: "4-bit matmul",
    size: "305 MB",
  },
  model_q4f16: {
    quantization: "4-bit matmul & fp16 weights",
    size: "154 MB",
  },
});

export type ModelId = keyof typeof models;
export const modelIds: ModelId[] = Object.keys(models) as ModelId[];
