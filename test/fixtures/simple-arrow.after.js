var x = () => 'x'

fs.readFile(x, function(err, res) {
  console.log(res)
})

const arr = [1, 2, 3, 4]

const arr2 = arr.map(x => x + 1)
