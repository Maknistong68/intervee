// Quick test for document loader
import {
  loadDocuments,
  getAllLaws,
  searchSections,
  searchByLaw,
  searchBySection,
  getRelevantKnowledge,
} from '../src/knowledge/documentLoader.js';

console.log('='.repeat(60));
console.log('Testing Document Loader');
console.log('='.repeat(60));

// Load documents
loadDocuments();

// Show what's loaded
const laws = getAllLaws();
console.log(`\n✓ Loaded ${laws.length} laws:\n`);
laws.forEach(law => {
  console.log(`  - ${law.name}: ${law.title.substring(0, 50)}... (${law.sections.length} sections)`);
});

// Test searches
console.log('\n' + '='.repeat(60));
console.log('Testing Searches');
console.log('='.repeat(60));

// Test 1: Search by query
console.log('\n1. Search: "safety officer training hours"');
const results1 = searchSections('safety officer training hours', 3);
results1.forEach(s => {
  console.log(`   - ${s.lawName}, ${s.sectionNumber}: ${s.content.substring(0, 80)}...`);
});

// Test 2: Search by law
console.log('\n2. Search by law: "rule1030"');
const results2 = searchByLaw('rule1030');
console.log(`   Found ${results2.length} sections in Rule 1030`);

// Test 3: Search by section number
console.log('\n3. Search by section: "Section 28"');
const results3 = searchBySection('Section 28');
results3.slice(0, 3).forEach(s => {
  console.log(`   - ${s.lawName}, ${s.sectionNumber}`);
});

// Test 4: Get relevant knowledge
console.log('\n4. Get relevant knowledge for: "What is the penalty for OSH violations?"');
const knowledge = getRelevantKnowledge('What is the penalty for OSH violations?');
console.log(`   Retrieved ${knowledge.length} characters of context`);
console.log(`   Preview: ${knowledge.substring(0, 200)}...`);

console.log('\n' + '='.repeat(60));
console.log('✓ Document Loader Test Complete!');
console.log('='.repeat(60));
