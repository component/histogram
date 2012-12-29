
# histogram

  JavaScript image histograms with Canvas.

  ![js histogram](http://cdn.dropmark.com/41933/195c6ba28e2bd32341350d1acb5a50d9b4b66b4d/main.png)

## Installation

    $ component install component/histogram

## Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>Histogram</title>
  <style>
    .histogram {
      background: #1a1a1a;
      opacity: .4;
    }
    .histogram .red {
      color: #dc1e1a;
    }
    .histogram .green {
      color: #12b81c;
    }
    .histogram .blue {
      color: #46a3d6;
    }
  </style>
</head>
<body>
  <canvas width=200 height=120></canvas>
  <script src="build/build.js"></script>

  <script>
    var histogram = require('histogram');
    var canvas = document.querySelector('canvas');

    var img = document.createElement('img');
    img.src = 'your img here';

    histogram(img)
      .smooth(12)
      .draw(canvas);
  </script>
</body>
</html>
```

## Styling

  By default the histogram will be completely black,
  for example the following has only an opacity applied:

  ![](http://cdn.dropmark.com/41933/4819d5cb323f839807bf2023969c5db875fecf9d/default-coloring.png)

  Using CSS you can style the canvas histogram however you like,
  for example the following CSS:

```css
.histogram {
  opacity: .4;
}
.histogram .red {
  color: #dc1e1a;
}
.histogram .green {
  color: #12b81c;
}
.histogram .blue {
  color: #46a3d6;
}
```

 yields:

   ![](http://cdn.dropmark.com/41933/3232b5147111926d36e24270de1d441d43be6317/white.png)

 For the dark theme used in the first image on this page use:

```css
.histogram {
  background: #1a1a1a;
  opacity: .4;
}
.histogram .red {
  color: #dc1e1a;
}
.histogram .green {
  color: #12b81c;
}
.histogram .blue {
  color: #46a3d6;
}
```

## Scaling

  The histogram's size will adjust to fit the canvas size, so use whatever dimensions you prefer:

  ![](http://cdn.dropmark.com/41933/1ebf9734bf5c09e8d4b986c0eca108fe47fee459/scaled.png)

## API

### .smooth([n])

  By default no smoothing is applied:

  ![no smoothing](http://cdn.dropmark.com/41933/24c9e31a80bc86ede792aaf1dbf3d144d4e30e60/no-smooth.png)

  When invoked without arguments (`.smooth()`) the
  default kernel of `6` is used:

  ![smoothing enabled](http://cdn.dropmark.com/41933/e4c31627d241db0b21e010eb72cdd853e4c9457d/smooth-default-6.png)

  You may also pass any kernel size you wish, here is `20` for
  example:

  ![larger kernel](http://cdn.dropmark.com/41933/6631116b859dc420ef3c532f241e1d77af8ddb3f/smooth-20.png)

## License

  MIT
