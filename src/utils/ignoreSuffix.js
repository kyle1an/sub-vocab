function clearSuffix(layer, base, $ = '$') {
    const w = layer;
    const a = [
        w?.e?.d?.$,
        w?.e?.s?.$,
        w?.i?.n?.g?.$,
        w?.i?.n?.g?.s?.$,
    ]
    if (base?.[$]) {
        [
            w?.$,
            ...a,
            w?.s?.$,
        ].filter(Boolean).forEach((p) => p._ = 0);
    }
    if (base?.e?.[$]) {
        [
            w?.e?.$,
            ...a,
        ].filter(Boolean).forEach((p) => p._ = 0);
    }
}

function deAffix(layer) {
    for (const k in layer) {
        const value = layer[k]
        deSuffix(value)
        deAffix(value, layer);
    }
}

function deSuffix(O) {
    [O?.s?.$,].filter(Boolean).forEach((_s$) => {
        [O?.$, O?.e?.d?.$, O?.i?.n?.g?.$, O?.i?.n?.g?.s?.$,].filter(Boolean).forEach((_x$) => {
            const sum = _x$._ + _s$._;
            _s$._ = 0
            _x$._ = 0
            if (!O.$?._) {
                O.$ = { '_': sum }
            } else {
                O.$._ += sum
            }
        })
    });

    [O?.e?.d?.$].filter(Boolean).forEach((_xx$) => {
        [O?.$, O?.e?.$].filter(Boolean).forEach((_$) => {
            _$._ += _xx$._
            _xx$._ = 0
        })
    });

    [O?.i?.n?.g?.$].filter(Boolean).forEach((_xx$) => {
        [O?.$, O?.e?.$].filter(Boolean).forEach((_$) => {
            _$._ += _xx$._
            _xx$._ = 0
        })
    });

    [O?.$].filter(Boolean).forEach((O$) => {
        [O?.["'"]?.s?.$, O?.["'"]?.l?.l?.$, O?.["'"]?.v?.e?.$, O?.["'"]?.d?.$,].filter(Boolean).forEach((_x$) => {
            O$._ += _x$._
            _x$._ = 0
        })
    });
}

export { deAffix, clearSuffix };
