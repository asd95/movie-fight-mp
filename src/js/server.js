 async function getData(type, text) {
  const res = await fetch(`https://www.omdbapi.com/?${type}=${text}&apikey=5b10b9a3`);
  if (!res.ok) {
    throw new Error(`Could not fetch ${res.url}, received ${res.status}`);
  }
  return res.json();
};