/**
 * aiService.ts — Service gọi API nhận diện nhãn mác AI
 */

import apiClient from './apiClient';

export interface DetectionResult {
  class: string;
  rawClass: string;
  classId: number;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RuleInstruction {
  symbol: string;
  meaning: string;
}

export interface RecommendationInfo {
  detectedSymbols: string[];
  instructions: RuleInstruction[];
  warnings: string[];
  finalAdvice: string[];
}

export interface AIDetectResponse {
  success: boolean;
  pipeline: string;
  modelId: string;
  image: {
    width?: number;
    height?: number;
  };
  detections: DetectionResult[];
  recommendation: RecommendationInfo;
  needStaffReview: boolean;
}

/**
 * Gọi Backend để phân tích ảnh nhãn mác quần áo bằng AI
 * @param file File ảnh (JPEG, PNG, WebP) được chọn từ client hoặc camera
 * @returns Trả về kết quả phân tích AI và hướng dẫn giặt đề xuất
 */
export const detectCareLabel = async (file: File): Promise<AIDetectResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<AIDetectResponse>('/ai/detect-care-label', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
