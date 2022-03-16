function resetSuffix(O, last) {
    O = (last === 'e') ? O : O?.[last];
    [
        ...(last === 'e' ? [O?.e?.$,] : [O?.$, O?.s?.$,]),
        O?.e?.d?.$,
        O?.e?.s?.$,
        O?.i?.n?.g?.$,
        O?.i?.n?.g?.s?.$,
    ].filter(Boolean).forEach(($) => $._ = 0);
}

function deAffix(layer) {
    for (const k in layer) {
        const value = layer[k]
        deSuffix(value)
        deAffix(value);
    }
}

function deSuffix(O) {
    [O?.s?.$,].filter(Boolean).forEach((Os$) => {
        [
            O?.$,
            O?.e?.d?.$,
            O?.i?.n?.g?.$,
            O?.i?.n?.g?.s?.$,
        ].filter(Boolean).forEach((_x$) => {
            const sum = _x$._ + Os$._;
            Os$._ = _x$._ = null
            if (!O.$?._) {
                O.$ = { '_': sum, '~': Os$['~'] - 1, '@': Math.min(_x$['@'], Os$['@']) }
            } else {
                O.$._ += sum
            }
        })
    });

    [O?.e?.d?.$].filter(Boolean).forEach((Oed$) => {
        [O?.$, O?.e?.$].filter(Boolean).forEach((Ox$) => {
            Ox$._ += Oed$._;
            Oed$._ = null;
        })
    });

    [O?.i?.n?.g?.$].filter(Boolean).forEach((Ong$) => {
        [O?.$, O?.e?.$].filter(Boolean).forEach((Ox$) => {
            Ox$._ += Ong$._
            Ong$._ = null
        })
    });

    [O?.$].filter(Boolean).forEach((O$) => {
        [
            O?.["'"]?.s?.$,
            O?.["'"]?.l?.l?.$,
            O?.["'"]?.v?.e?.$,
            O?.["'"]?.d?.$,
        ].filter(Boolean).forEach((_x$) => {
            O$._ += _x$._
            _x$._ = null
        })
    });
}

export { deAffix, resetSuffix };
