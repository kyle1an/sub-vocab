import _ from "lodash/fp.js";

function clearSuffix(layer, base, TER = '$') {
    if (base?.[TER]) {
        const w = layer
        if (w?.$) w.$._ = 0
        if (w?.e?.d?.$) w.e.d.$._ = 0
        if (w?.e?.s?.$) w.e.s.$._ = 0
        if (w?.i?.n?.g?.$) w.i.n.g.$._ = 0
        if (w?.s?.$) w.s.$._ = 0
    }
    if (base?.e?.[TER]) {
        const e = layer?.e;
        if (e) {
            if (e?.$) e.$._ = 0
            if (e?.d?.$) e.d.$._ = 0
            if (e?.s?.$) e.s.$._ = 0
        }
        const ing = layer?.i?.n?.g
        if (ing) {
            if (ing?.$) ing.$._ = 0
            if (ing?.s?.$) ing.s.$._ = 0
        }
    }
}

function deAffix(layer) {
    for (const k in layer) {
        const value = layer[k]
        deSuffix(value)
        deAffix(value, layer);
    }
}

function deSuffix(layer) {
    const $ = { '$': {} }
    const ed = [
        { ...$, 'e': { 'd': $ }, },
        { 'e': { ...$, 'd': $, }, },
    ]
    const edMod = (l) => {
        if (_.isMatch(ed[0], l)) {
            l.$._ += l.e.d.$._
            l.e.d.$._ = 0
        } else if (_.isMatch(ed[1], l)) {
            l.e.$._ += l.e.d.$._
            l.e.d.$._ = 0
        }
    }

    const ing = [
        {
            ...$,
            'i': { 'n': { 'g': $ } },
        },
        {},
        {
            'e': { ...$, 'd': $, },
            'i': { 'n': { 'g': $ } },
        }
    ]
    const ingMod = (l) => {
        if (_.isMatch(ing[0], l)) {
            l.$._ += l.i.n.g.$._
            l.i.n.g.$._ = 0
        } else if (_.isMatch(ing[2], l)) {
            l.e.$._ += l.i.n.g.$._ + l.e.d.$._
            l.i.n.g.$._ = 0
            l.e.d.$._ = 0
        }
    }

    const apostrophe = [
        { ...$, "'": { 's': $ }, },
        { ...$, "'": { 'l': { 'l': $ } }, },
        { ...$, "'": { 'v': { 'e': $ } }, },
        { ...$, "'": { 'd': $ }, }
    ]
    const apostropheMod = (l) => {
        if (Object.hasOwn(l, '$')) {
            const _$ = l?.["'"];
            [_$?.s, _$?.d, _$?.l?.l, _$?.v?.e].forEach((_) => {
                if (_) {
                    console.log(_)
                    l.$._ += _.$._
                    _.$._ = 0
                }
            });
        }
    }
    const sMod = (l) => {
        if (_.isMatch({
            ...$,
            's': $
        }, l)) {
            l.$._ += l.s.$._
            l.s.$._ = 0
        }
    }
    const merge = () => {
        sMod(layer);
        edMod(layer);
        ingMod(layer);
        apostropheMod(layer);
    }
    merge();
}

export { deAffix, clearSuffix };
