fetch('https://api.digitallatino.com/api/report/getDataArtist/0du5cEVh5yTK9QJze8zA0C')
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(err => console.error(err));
