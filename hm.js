const fs = require('fs');
const path = require('path');

// Read all txt files and combine into single JSON
function combineTxtToJson() {
  try {
    const files = [
      { name: 'indonesian-words.txt', key: 'indonesian' },
      { name: 'list_0.5.1.txt', key: 'list_0.5.1' },
      { name: 'list_1.0.0.txt', key: 'list_1.0.0' },
      { name: 'istilah-kedokteran.txt', key: 'kedokteran' }
    ];

    const combinedData = {};
    let totalWords = 0;

    // Read each file and combine
    files.forEach(file => {
      try {
        const content = fs.readFileSync(file.name, 'utf8');
        const words = content
          .split('\n')
          .map(word => word.trim())
          .filter(word => word.length > 0 && !word.includes(' ')); // Remove multi-word entries
        
        combinedData[file.key] = {
          count: words.length,
          words: words
        };
        
        totalWords += words.length;
        console.log(`✓ ${file.name}: ${words.length} words`);
      } catch (error) {
        console.log(`⚠ ${file.name}: ${error.message}`);
      }
    });

    // Deduplicate all words across files
    const uniqueWordsSet = new Set();
    Object.keys(combinedData).forEach(key => {
      if (key !== 'metadata' && combinedData[key].words) {
        combinedData[key].words.forEach(word => uniqueWordsSet.add(word));
      }
    });

    // Clean data: keep only words with letters (no symbols, numbers, hyphens, etc.)
    const cleanedWords = Array.from(uniqueWordsSet).filter(word => {
      // Only keep words that contain only letters (including Indonesian diacritics)
      return /^[a-zA-ZäöüßÄÖÜáéíóúàèìòùâêîôûãõñçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÑÇ]+$/.test(word);
    }).sort();
    
    const uniqueWords = cleanedWords;
    
    // Add unique list to combined data
    combinedData.unique = {
      count: uniqueWords.length,
      words: uniqueWords
    };

    // Save combined JSON
    fs.writeFileSync('combined-words.json', JSON.stringify(combinedData, null, 2));
    console.log(`\n✓ Combined file saved: combined-words.json`);
    console.log(`✓ Total unique words: ${uniqueWords.length}`);
    
    // Save as JavaScript file (no fetch needed!)
    const jsContent = `const allWords = ${JSON.stringify(uniqueWords)};`;
    fs.writeFileSync('data.js', jsContent);
    console.log(`✓ JavaScript file saved: data.js`);
    console.log(`✓ You can now open index.html in your browser!`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run conversion
combineTxtToJson();