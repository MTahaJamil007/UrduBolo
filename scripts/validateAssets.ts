import fs from "fs";
import path from "path";

// Resolves the absolute root path of the project.
const projectRoot = path.resolve(__dirname, "..");

// Load the main content manifest
const manifestPath = path.join(projectRoot, "content", "manifest.json");
if (!fs.existsSync(manifestPath)) {
  console.error(`[Error] manifest.json not found at: ${manifestPath}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
let overallSuccess = true;
let totalMissing = 0;

console.log("=========================================");
console.log("     BOLO URDU — ASSET VALIDATOR         ");
console.log("=========================================");

for (const item of manifest.chapters) {
  const chapterRelativePath = path.join("content", item.contentFile);
  const chapterAbsolutePath = path.join(projectRoot, chapterRelativePath);
  
  console.log(`\nEvaluating Chapter ${item.id} — "${item.title}"`);
  
  if (!fs.existsSync(chapterAbsolutePath)) {
    console.log(`⚠️  [Skipped] Chapter content file does not exist: ${chapterRelativePath}`);
    continue;
  }

  const chapter = JSON.parse(fs.readFileSync(chapterAbsolutePath, "utf8"));
  const missingFiles: string[] = [];

  // 1. Validate Phrase Audios
  if (Array.isArray(chapter.phrases)) {
    for (const phrase of chapter.phrases) {
      if (phrase.audio) {
        if (phrase.audio.normal) {
          const normalPath = path.join(projectRoot, "assets", phrase.audio.normal);
          if (!fs.existsSync(normalPath)) {
            missingFiles.push(phrase.audio.normal);
          }
        }
        if (phrase.audio.slow) {
          const slowPath = path.join(projectRoot, "assets", phrase.audio.slow);
          if (!fs.existsSync(slowPath)) {
            missingFiles.push(phrase.audio.slow);
          }
        }
      }
    }
  }

  // 2. Validate SCENARIO_TURN Audios inside Level Exercise Sequences
  if (Array.isArray(chapter.levels)) {
    for (const level of chapter.levels) {
      if (Array.isArray(level.exerciseSequence)) {
        for (const exercise of level.exerciseSequence) {
          if (
            exercise.type === "SCENARIO_TURN" &&
            exercise.speakerLine &&
            exercise.speakerLine.audio
          ) {
            const speakerAudioPath = path.join(projectRoot, "assets", exercise.speakerLine.audio);
            if (!fs.existsSync(speakerAudioPath)) {
              missingFiles.push(exercise.speakerLine.audio);
            }
          }
        }
      }
    }
  }

  if (missingFiles.length > 0) {
    console.log(`❌ Failed: Found ${missingFiles.length} missing audio files:`);
    for (const file of missingFiles) {
      console.log(`   - assets/${file}`);
    }
    totalMissing += missingFiles.length;
    overallSuccess = false;
  } else {
    console.log(`✅ Passed: All referenced audio assets found.`);
  }
}

console.log("\n=========================================");
if (overallSuccess) {
  console.log("🎉 SUCCESS: All asset validations passed! ");
  console.log("=========================================");
  process.exit(0);
} else {
  console.log(`🛑 FAILED: ${totalMissing} audio file(s) are missing.`);
  console.log("=========================================");
  process.exit(1);
}
