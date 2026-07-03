import { Point, CircleResult } from '../types';

/**
 * Calculates the Euclidean distance between two points.
 */
export const distance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

/**
 * Calculates the grade based on the score.
 */
export const getGrade = (score: number, isClosed: boolean): string => {
  if (!isClosed) return 'F';
  if (score >= 98.5) return 'S';
  if (score >= 96) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 88) return 'B';
  if (score >= 80) return 'C';
  if (score >= 70) return 'D';
  return 'F';
};

/**
 * Analyzes a set of points to determine how close they represent a perfect circle.
 */
export const analyzeCircle = (points: Point[]): CircleResult | null => {
  if (points.length < 10) return null;

  // 1. Find Centroid (approximate center)
  const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  const center: Point = {
    x: sum.x / points.length,
    y: sum.y / points.length,
  };

  // 2. Calculate average radius
  const radii = points.map(p => distance(p, center));
  const avgRadius = radii.reduce((a, b) => a + b, 0) / radii.length;

  // 3. Calculate deviation (Standard Deviation of the radii)
  const squaredDiffs = radii.map(r => Math.pow(r - avgRadius, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length;
  const stdDev = Math.sqrt(avgSquaredDiff);

  // 4. Calculate Closure
  const startPoint = points[0];
  const endPoint = points[points.length - 1];
  const closureGap = distance(startPoint, endPoint);
  // Threshold: Gap should be less than 15% of the radius to be considered "attempted closure"
  // or reasonably close in pixels.
  const isClosed = closureGap < avgRadius * 0.4 || closureGap < 50;

  // 5. Calculate Score
  // Normalized deviation: lower is better.
  // Ideally stdDev should be 0.
  // If stdDev is 10% of radius, that's decent.
  // We use an exponential decay for scoring to make high scores hard.
  const errorRatio = stdDev / avgRadius;
  
  // Base score calculation
  // 0.0 error = 100
  // 0.05 error (5% deviation) ~= 95
  // 0.10 error (10% deviation) ~= 85
  // 0.20 error (20% deviation) ~= 60
  
  let rawScore = 100 * Math.exp(-3 * errorRatio);
  
  // Penalize for bad closure
  if (!isClosed) {
    rawScore = Math.min(rawScore, 59); // Automatic F if not closed
  } else {
    // Slight penalty for closure gap even if considered "closed"
    const closurePenalty = (closureGap / avgRadius) * 10;
    rawScore -= closurePenalty;
  }

  // Penalize for too small circle
  if (avgRadius < 30) {
    rawScore *= 0.5;
  }

  const finalScore = Math.max(0, Math.min(100, rawScore));

  return {
    score: finalScore,
    grade: getGrade(finalScore, isClosed),
    center,
    radius: avgRadius,
    deviation: stdDev,
    closureGap,
    isClosed,
    points
  };
};
