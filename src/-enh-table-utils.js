import immutable from "immutable";
import { SortDirection } from "react-virtualized";

export function ImmutableRecordset({ list, ...rest }) {
  //if (!list) list = rest.store.getItems();
  this.items = () => list;
  this.size = () => list.size;
  this.sortBy = () => rest.sortBy;
  this.sortDirection = () => rest.sortDirection;

  this.load = () => {
    return new ImmutableRecordset({
      list: rest.store.getItems(),
      ...rest
    });
  };

  this.search = (searchPredicate) => {
    var tmp = rest.store.getItems();
    const result = searchPredicate ? tmp.filter(searchPredicate) : tmp;
    return new ImmutableRecordset({
      list: result,
      ...rest,
      searchPredicate
    });
  };

  this.sort = ({ sortBy, sortDirection }) => {
    const result = list
      .sortBy(item => item[sortBy])
      .update(list =>
        sortDirection === SortDirection.DESC ? list.reverse() : list
      );
    return new ImmutableRecordset({
      list: result,
      ...rest,
      sortBy,
      sortDirection
    });
  };

  this.add = data => {
    rest.store.add(data);
    const result = list.push(data);
    return new ImmutableRecordset({
      list: result,
      ...rest
    });
  };

  this.update = data => {};

  this.remove = ([...data]) => {
    rest.store.remove(data);
    const result = list.filterNot(r => data.indexOf(r) >= 0);
    return new ImmutableRecordset({
      list: result,
      ...rest
    });
  };
}

export function ImmutableSelection({
  set = new immutable.Set(),
  isEnabled,
  isMulti
}) {
  this.isEnabled = () => isEnabled;
  this.isMulti = () => isMulti;
  this.isPartial = totalCount =>
    totalCount > 0 && totalCount > set.size && set.size > 0;

  this.has = data => set.has(data);
  this.size = () => set.size;

  this.set = data => {
    var tmp = !isEnabled ? set : (isMulti ? set : set.clear()).add(data);
    return new ImmutableSelection({
      set: tmp,
      isEnabled,
      isMulti
    });
  };

  this.reset = data => {
    if (!isEnabled) return set;
    var tmp = !isEnabled ? set : isMulti ? set.delete(data) : set.clear();
    return new ImmutableSelection({
      set: tmp,
      isEnabled,
      isMulti
    });
  };

  this.toggle = data => {
    return set.has(data) ? this.reset(data) : this.set(data);
  };

  this.all = list => {
    return new ImmutableSelection({
      set: new immutable.Set(list),
      isEnabled,
      isMulti
    });
  };

  this.none = () => {
    return new ImmutableSelection({
      set: new immutable.Set(),
      isEnabled,
      isMulti
    });
  };
}
