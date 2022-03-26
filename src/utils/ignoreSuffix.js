function resetSuffix(O, last) {
    O = (last === 'e') ? O : O?.[last];
    for (const $ of [
        ...(last === 'e' ? [O?.e?.$,] : [O?.$, O?.s?.$,]),
        O?.e?.d?.$,
        O?.e?.s?.$,
        O?.i?.n?.g?.$,
        O?.i?.n?.g?.s?.$,
    ]) if ($) $.F = true
}

function deAffix(layer) {
    for (const k in layer) {
        const value = layer[k]
        deSuffix(value)
        deAffix(value);
    }
}

function deSuffix(O) {
    if (O?.s?.$) {
        const Os$ = O?.s?.$;
        for (const _x$ of [
            O?.$,
            O?.e?.d?.$,
            O?.i?.n?.g?.$,
            O?.i?.n?.g?.s?.$,
        ]) if (_x$) {
            const sum = _x$._ + Os$._;
            Os$._ = _x$._ = null
            if (!O.$?._) {
                O.$ = { '_': sum, '~': Os$['~'] - 1, '@': Math.min(_x$['@'], Os$['@']) }
            } else {
                O.$._ += sum
            }
        }
    }

    if (O?.e?.d?.$) {
        const Oed$ = O?.e?.d?.$;
        for (const Ox$ of [O?.$, O?.e?.$]) if (Ox$) {
            Ox$._ += Oed$._;
            Oed$._ = null;
        }
    }

    if (O?.i?.n?.g?.$) {
        const Ong$ = O?.i?.n?.g?.$;
        for (const Ox$ of [O?.$, O?.e?.$]) if (Ox$) {
            Ox$._ += Ong$._
            Ong$._ = null
        }
    }

    if (O?.$) {
        const O$ = O?.$;
        for (const _x$ of [
            O?.["'"]?.s?.$,
            O?.["'"]?.l?.l?.$,
            O?.["'"]?.v?.e?.$,
            O?.["'"]?.d?.$,
        ]) if (_x$) {
            O$._ += _x$._
            _x$._ = null
        }
    }
}

export { deAffix, resetSuffix };
