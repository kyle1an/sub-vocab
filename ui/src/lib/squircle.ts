/* eslint-disable antfu/consistent-list-newline */
import { math } from 'polished'

type Size = {
  width: number
  height: number
}

type Radii = [number, number, number, number]

type Params = {
  radii: Radii
  smooth: number
  thickness: number
  strokeColor: string
  fillColor: string
}

type Shorthand<T> = [T] | [T, T] | [T, T, T] | [T, T, T, T]

function shorthandToConstituent<T>(shorthand: Shorthand<T>): [T, T, T, T] {
  if (shorthand.length === 1) {
    const [first] = shorthand
    return [
      first,
      first,
      first,
      first,
    ]
  } else if (shorthand.length === 2) {
    const [first, second] = shorthand
    return [
      first,
      second,
      first,
      second,
    ]
  } else if (shorthand.length === 3) {
    const [first, second, third] = shorthand
    return [
      first,
      second,
      third,
      second,
    ]
  } else {
    return shorthand
  }
}

function squircleLine(region: Path2D, radii: Radii, size: Size, smooth: number, _offset = 0) {
  const { width, height } = size
  const [tl, tr, br, bl] = radii

  // OPEN LEFT-TOP CORNER
  region.lineTo(tl + _offset, 0 + _offset)

  // TOP-RIGHT CORNER
  region.lineTo(width - tr + _offset, 0 + _offset)
  region.bezierCurveTo(
    width - tr / smooth + _offset, 0 + _offset, // first bezier point
    width + _offset, tr / smooth + _offset, // second bezier point
    width + _offset, tr + _offset, // last connect point
  )

  // BOTTOM-RIGHT CORNER
  region.lineTo(width + _offset, height - br + _offset)
  region.bezierCurveTo(
    width + _offset, height - br / smooth + _offset, // first bezier point
    width - br / smooth + _offset, height + _offset, // second bezier point
    width - br + _offset, height + _offset, // last connect point
  )

  // BOTTOM-LEFT CORNER
  region.lineTo(bl + _offset, height + _offset)
  region.bezierCurveTo(
    bl / smooth + _offset, height + _offset, // first bezier point
    0 + _offset, height - bl / smooth + _offset, // second bezier point
    0 + _offset, height - bl + _offset, // last connect point
  )

  // CLOSE LEFT-TOP CORNER
  region.lineTo(0 + _offset, tl + _offset)
  region.bezierCurveTo(
    0 + _offset, tl / smooth + _offset, // first bezier point
    tl / smooth + _offset, 0 + _offset, // second bezier point
    tl + _offset, 0 + _offset, // last connect point
  )
}

function drawSquircle(ctx: CanvasRenderingContext2D, size: Size, params: Params) {
  const {
    radii,
    smooth,
    thickness,
    strokeColor,
    fillColor,
  } = params
  const outerRegion = new Path2D()
  squircleLine(outerRegion, radii, size, smooth)

  if (thickness === 0) {
    outerRegion.closePath()
    ctx.fillStyle = fillColor
    ctx.fill(outerRegion)
  } else {
    const innerRadii = radii.map((r) => Math.max(0, r - thickness)) as Radii
    const innerSize = {
      width: size.width - thickness * 2,
      height: size.height - thickness * 2,
    }
    squircleLine(outerRegion, innerRadii, innerSize, smooth, thickness)
    const [tl] = radii
    outerRegion.lineTo(tl, 0)
    outerRegion.closePath()
    ctx.fillStyle = strokeColor
    ctx.fill(outerRegion, 'evenodd')

    const innerRegion = new Path2D()
    squircleLine(innerRegion, innerRadii, innerSize, smooth, thickness)
    innerRegion.closePath()
    ctx.fillStyle = fillColor
    ctx.fill(innerRegion)
  }
}

const INDIVIDUAL_RADII_PROPS = [
  '--squircle-radius-top-left', // <-- if the order changes ...
  '--squircle-radius-top-right',
  '--squircle-radius-bottom-right',
  '--squircle-radius-bottom-left', // --> the slice values of individualRadiiProps need to be updated
] as const

const __SQUIRCLE = {
  RADIUS: '--squircle-radius',
  SMOOTH: '--squircle-smooth',
  OUTLINE: '--squircle-outline',
  FILL: '--squircle-fill',
  STROKE: '--squircle-stroke',
} as const

const INPUT_PROPERTIES = [
  ...Object.values(__SQUIRCLE),
  ...INDIVIDUAL_RADII_PROPS,
] as const

const SMOOTH_RATIO = 10
const DISTANCE_RATIO = 1.8
const DEFAULT_RADIUS = 8
const radiusRegex = /\d+(\.\d+)?/g // Units are ignored.

function getSmoothValue(squircleSmooth: CSSUnitValue | CSSUnparsedValue) {
  let smooth: number
  if ('value' in squircleSmooth) {
    smooth = Number(squircleSmooth.value)
  } else {
    smooth = Number(squircleSmooth[0] ?? 1)
  }
  return smooth * SMOOTH_RATIO
}

function getRadiiValue(size: Size, props: any) {
  const individualRadiiProps = INDIVIDUAL_RADII_PROPS.map((prop) => {
    const value = props.get(prop)
    return value ? Number.parseInt(value, 10) * DISTANCE_RATIO : Number.NaN
  })

  let constituentRadii: Radii

  // Check if any of the individual radii are NaN, if so, process the shorthand
  if (individualRadiiProps.some(Number.isNaN)) {
    let radiusShorthand = String(props.get(__SQUIRCLE.RADIUS))
    const match = radiusShorthand.match(/calc\(([^)]+)\)/)
    if (match) {
      radiusShorthand = math(match[1] ?? '')
    }
    const matches = radiusShorthand.match(radiusRegex)

    if (matches) {
      const shorthandRadii = matches.map((val) => Number.parseFloat(val) * DISTANCE_RATIO) as Shorthand<number>
      constituentRadii = shorthandToConstituent(shorthandRadii)
    } else {
      // if no radii at all are provided, set default radius = 8, otherwise set undefined ones to 0
      const defaultRadius = individualRadiiProps.every(Number.isNaN)
        ? DEFAULT_RADIUS * DISTANCE_RATIO
        : 0
      constituentRadii = [
        defaultRadius,
        defaultRadius,
        defaultRadius,
        defaultRadius,
      ]
    }
  }
  // Replace NaN values in radii with corresponding values from shorthand or default
  const minRadius = Math.min(size.width, size.height) / 2
  return individualRadiiProps
    .map((val, i) => Number.isNaN(val) ? constituentRadii[i] as number : val)
    .map((radius) => Math.min(radius, minRadius)) as Radii
}

class SquircleClass {
  static get contextOptions() {
    return { alpha: true }
  }

  static get inputProperties() {
    return INPUT_PROPERTIES
  }

  paint(ctx: CanvasRenderingContext2D, size: Size, props: any) {
    const radii = getRadiiValue(size, props)
    const smooth = getSmoothValue(props.get(__SQUIRCLE.SMOOTH))
    const thickness = Number.parseFloat(props.get(__SQUIRCLE.OUTLINE)) || 0
    const strokeColor = String(props.get(__SQUIRCLE.STROKE))
    const fillColor = String(props.get(__SQUIRCLE.FILL)) || 'transparent'
    drawSquircle(
      ctx,
      size,
      {
        radii,
        smooth,
        thickness,
        strokeColor,
        fillColor,
      },
    )
  }
}

// @ts-expect-error
if (typeof registerPaint !== 'undefined') {
  // @ts-expect-error
  registerPaint('squircle', SquircleClass)
}
