import { math } from 'polished'

type Size = {
  width: number
  height: number
}

type IndividualProps<T> = [tl: T, tr: T, rt: T, rb: T, br: T, bl: T, lb: T, lt: T]

type Radii = IndividualProps<number>

type Smooths = IndividualProps<number>

type Params = {
  radii: Radii
  smooths: Smooths
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

const CONSTITUENT_MAP_INDIVIDUAL = [
  [0, 7],
  [1, 2],
  [3, 4],
  [5, 6],
]

function constituentToIndividual<T>(constituent: [T, T, T, T]) {
  const individual: T[] = []
  constituent.forEach((v, i) => {
    (CONSTITUENT_MAP_INDIVIDUAL[i]!).forEach((j) => {
      individual[j] = v
    })
  })
  return individual as [T, T, T, T, T, T, T, T]
}

const X_PROPS_INDEXES = [2, 3, 6, 7]
const Y_PROPS_INDEXES = [0, 1, 4, 5]

function squircleLine(path: Path2D | CanvasRenderingContext2D, radii: Radii, size: Size, smooths: Smooths, _offset = 0) {
  const { width, height } = size
  const [tl_Radius, tr_Radius, rt_Radius, rb_Radius, br_Radius, bl_Radius, lb_Radius, lt_Radius] = radii
  const [tl_Smooth, tr_Smooth, rt_Smooth, rb_Smooth, br_Smooth, bl_Smooth, lb_Smooth, lt_Smooth] = smooths

  // OPEN LEFT-TOP CORNER
  path.lineTo(tl_Radius + _offset, 0 + _offset)

  // TOP-RIGHT CORNER
  path.lineTo(width - tr_Radius + _offset, 0 + _offset)
  path.bezierCurveTo(
    width - tr_Radius / tr_Smooth + _offset, 0 + _offset, // first bezier point
    width + _offset, rt_Radius / rt_Smooth + _offset, // second bezier point
    width + _offset, rt_Radius + _offset, // last connect point
  )

  // BOTTOM-RIGHT CORNER
  path.lineTo(width + _offset, height - rb_Radius + _offset)
  path.bezierCurveTo(
    width + _offset, height - rb_Radius / rb_Smooth + _offset, // first bezier point
    width - br_Radius / br_Smooth + _offset, height + _offset, // second bezier point
    width - br_Radius + _offset, height + _offset, // last connect point
  )

  // BOTTOM-LEFT CORNER
  path.lineTo(bl_Radius + _offset, height + _offset)
  path.bezierCurveTo(
    bl_Radius / bl_Smooth + _offset, height + _offset, // first bezier point
    0 + _offset, height - lb_Radius / lb_Smooth + _offset, // second bezier point
    0 + _offset, height - lb_Radius + _offset, // last connect point
  )

  // CLOSE LEFT-TOP CORNER
  path.lineTo(0 + _offset, lt_Radius + _offset)
  path.bezierCurveTo(
    0 + _offset, lt_Radius / lt_Smooth + _offset, // first bezier point
    tl_Radius / tl_Smooth + _offset, 0 + _offset, // second bezier point
    tl_Radius + _offset, 0 + _offset, // last connect point
  )
}

function drawSquircle(ctx: CanvasRenderingContext2D, size: Size, params: Params) {
  const {
    radii,
    smooths,
    thickness,
    strokeColor,
    fillColor,
  } = params
  const innerRadii = radii.map((r) => Math.max(0, r - thickness)) as Radii
  const innerSize = {
    width: size.width - thickness * 2,
    height: size.height - thickness * 2,
  }
  const border = new Path2D()
  squircleLine(border, radii, size, smooths)
  ctx.fillStyle = strokeColor
  squircleLine(border, innerRadii, innerSize, smooths, thickness)
  ctx.fill(border, 'evenodd')

  squircleLine(ctx, innerRadii, innerSize, smooths, thickness)
  ctx.fillStyle = fillColor
  ctx.fill()
}

const RADII_PROPS = [
  '--squircle-radius-top-left', // <-- if the order changes ...
  '--squircle-radius-top-right',
  '--squircle-radius-bottom-right',
  '--squircle-radius-bottom-left', // --> the slice values of individualRadiiProps need to be updated
] as const

const INDIVIDUAL_RADII_PROPS = [
  '--squircle-top-left-radius',
  '--squircle-top-right-radius',
  '--squircle-right-top-radius',
  '--squircle-right-bottom-radius',
  '--squircle-bottom-right-radius',
  '--squircle-bottom-left-radius',
  '--squircle-left-bottom-radius',
  '--squircle-left-top-radius',
] as const

const INDIVIDUAL_SMOOTH_PROPS = [
  '--squircle-top-left-smooth',
  '--squircle-top-right-smooth',
  '--squircle-right-top-smooth',
  '--squircle-right-bottom-smooth',
  '--squircle-bottom-right-smooth',
  '--squircle-bottom-left-smooth',
  '--squircle-left-bottom-smooth',
  '--squircle-left-top-smooth',
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
  ...RADII_PROPS,
  ...INDIVIDUAL_RADII_PROPS,
  ...INDIVIDUAL_SMOOTH_PROPS,
  '--squircle-circle-smooth',
] as const

const SMOOTH_RATIO = 10
const DISTANCE_RATIO = 1.8
const DEFAULT_RADIUS = 8
const radiusRegex = /\d+(\.\d+)?/g // Units are ignored.
const DEFAULT_RADIUS_VALUE = DEFAULT_RADIUS * DISTANCE_RATIO
const DEFAULT_CIRCLE_SMOOTH = 0.2

function getSmoothValue(squircleSmooth: CSSUnitValue | CSSUnparsedValue, size: Size, radii: Radii, props: any) {
  let smooth: number
  if ('value' in squircleSmooth) {
    smooth = Number(squircleSmooth.value)
  } else {
    smooth = Number(squircleSmooth[0] ?? 1)
  }
  const smooths: Smooths = [smooth, smooth, smooth, smooth, smooth, smooth, smooth, smooth]
  const smoothCircle = Number.parseFloat(props.get('--squircle-circle-smooth')) || DEFAULT_CIRCLE_SMOOTH
  radii.forEach((radius, i) => {
    if (X_PROPS_INDEXES.includes(i)) {
      const min = size.height / 2
      if (radius >= min) {
        smooths[i] = smoothCircle
      }
    } else if (Y_PROPS_INDEXES.includes(i)) {
      const min = size.width / 2
      if (radius >= min) {
        smooths[i] = smoothCircle
      }
    }
  })
  INDIVIDUAL_SMOOTH_PROPS.forEach((prop, i) => {
    const value = Number.parseFloat(props.get(prop))
    if (!Number.isNaN(value)) {
      smooths[i] = value
    }
  })
  smooths.forEach((smooth, i) => {
    smooths[i] = smooth * SMOOTH_RATIO
  })
  return smooths
}

function getRadiiValue(size: Size, props: any) {
  let radiusShorthand = String(props.get(__SQUIRCLE.RADIUS))
  const match = radiusShorthand.match(/calc\(([^)]+)\)/)
  if (match) {
    radiusShorthand = math(match[1] ?? '')
  }
  let radii: Radii
  const matches = radiusShorthand.match(radiusRegex)
  if (matches) {
    const shorthandRadii = matches.map((val) => Number.parseFloat(val) * DISTANCE_RATIO) as Shorthand<number>
    radii = constituentToIndividual(shorthandToConstituent(shorthandRadii))
  } else {
    radii = [
      DEFAULT_RADIUS_VALUE,
      DEFAULT_RADIUS_VALUE,
      DEFAULT_RADIUS_VALUE,
      DEFAULT_RADIUS_VALUE,
      DEFAULT_RADIUS_VALUE,
      DEFAULT_RADIUS_VALUE,
      DEFAULT_RADIUS_VALUE,
      DEFAULT_RADIUS_VALUE,
    ]
  }

  RADII_PROPS.forEach((prop, i) => {
    const value = Number.parseFloat(props.get(prop))
    if (!Number.isNaN(value)) {
      (CONSTITUENT_MAP_INDIVIDUAL[i]!).forEach((j) => {
        radii[j] = value * DISTANCE_RATIO
      })
    }
  })

  INDIVIDUAL_RADII_PROPS.forEach((prop, i) => {
    const value = Number.parseFloat(props.get(prop))
    if (!Number.isNaN(value)) {
      radii[i] = value * DISTANCE_RATIO
    }
  })

  radii.forEach((radius, i) => {
    if (X_PROPS_INDEXES.includes(i)) {
      const min = size.height / 2
      if (radius > min) {
        radii[i] = min
      }
    } else if (Y_PROPS_INDEXES.includes(i)) {
      const min = size.width / 2
      if (radius > min) {
        radii[i] = min
      }
    }
  })

  return radii
}

class SquircleClass {
  static get contextOptions() {
    return { alpha: true }
  }

  static get inputProperties() {
    return INPUT_PROPERTIES
  }

  paint(ctx: CanvasRenderingContext2D, size: Size, props: any) {
    const thickness = Number.parseFloat(props.get(__SQUIRCLE.OUTLINE)) || 0
    const strokeColor = String(props.get(__SQUIRCLE.STROKE)) || 'transparent'
    const fillColor = String(props.get(__SQUIRCLE.FILL)) || 'transparent'
    const radii = getRadiiValue(size, props)
    const smooths = getSmoothValue(props.get(__SQUIRCLE.SMOOTH), size, radii, props)
    drawSquircle(ctx, size, {
      radii,
      smooths,
      thickness,
      strokeColor,
      fillColor,
    })
  }
}

// @ts-expect-error
if (typeof registerPaint !== 'undefined') {
  // @ts-expect-error
  registerPaint('squircle', SquircleClass)
}
