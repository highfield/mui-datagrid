import immutable from "immutable";

export function SelectAll() {
  return function(recordset, selection, isMulti) {
    return {
      recs: isMulti ? immutable.Set(recordset) : immutable.Set()
    };
  };
}

export function SelectNone() {
  return function(recordset, selection, isMulti) {
    return { recs: immutable.Set() };
  };
}

export function SelectToggle(target) {
  return function(recordset, selection, isMulti) {
    const tmp = purgeSelection(recordset, selection, isMulti, target);
    return {
      recs: tmp.has(target)
        ? tmp.delete(target)
        : recordset.indexOf(target) >= 0
        ? tmp.add(target)
        : tmp
    };
  };
}

export function SelectSet(target) {
  return function(recordset, selection, isMulti) {
    const tmp = purgeSelection(recordset, selection, isMulti, target);
    const recs = recordset.indexOf(target) >= 0 ? tmp.add(target) : tmp;
    var scrollToIndex;
    if (recs.size === 1) {
      scrollToIndex = recordset.indexOf(recs.first());
    }
    return {
      recs,
      scrollToIndex
    };
  };
}

export function SelectReset(target) {
  return function(recordset, selection, isMulti) {
    const tmp = purgeSelection(recordset, selection, isMulti, target);
    return { recs: tmp.delete(target) };
  };
}

function purgeSelection(recordset, selection, isMulti, target) {
  return isMulti
    ?selection.filter(rec => recordset.indexOf(rec) >= 0)
    : target
    ? selection.filter(rec => rec === target)
    : selection.clear();
}
