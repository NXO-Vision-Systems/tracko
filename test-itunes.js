async function test() {
  const query = "Tiakola Savage";
  const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=5`);
  const data = await res.json();
  data.results.forEach(r => {
    console.log(`Song: ${r.trackName} | Artist: ${r.artistName}`);
  });
}
test();
