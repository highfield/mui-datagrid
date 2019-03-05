//see: https://material-ui.com/demos/tables/
//see: https://github.com/bvaughn/react-virtualized

import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import TableCell from "@material-ui/core/TableCell";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Checkbox from "@material-ui/core/Checkbox";
import {
  AutoSizer,
  Column,
  SortDirection,
  Table,
  defaultTableRowRenderer
} from "react-virtualized";
import EnhancedTableToolbar from "./enh-table-toolbar";
import EnhancedTableFooter from "./enh-table-footer";
import { SelectAll, SelectNone, SelectToggle } from "./enh-table-utils";
//import EnhancedTableRowRenderer from "./enh-table-row-renderer";
//import { ImmutableSelection } from "./enh-table-utils";
import immutable from "immutable";
import memoize from "memoize-one";
//import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const styles = theme => ({
  root: {
    display: "grid",
    gridTemplateRows: "auto minmax(0, 1fr) auto",
    gridTemplateColumns: "minmax(0, 1fr)",
    height: "100%"
  },
  table: {
    fontFamily: theme.typography.fontFamily
  },
  flexContainer: {
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box"
  },
  tableRow: {
    cursor: "pointer",
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.grey[300],
    borderBottomStyle: "solid"
  },
  tableRowHover: {
    "&:hover": {
      backgroundColor: theme.palette.grey[200]
    }
  },
  tableCell: {
    flex: 1,
    border: "none"
  },
  noClick: {
    cursor: "initial"
  }
});

const selDataKey = "__sel__";

class EnhancedTable extends React.PureComponent {
  constructor(props) {
    super(props);

    //const { selectionMode } = props;

    const sortBy = "";
    const sortDirection = SortDirection.ASC;
    this.state = {
      //sortedList: new immutable.List(),
      searchPredicate: null,
      sortBy,
      sortDirection,
      selectionRequest: null
      //recordset: new ImmutableRecordset({
      //  store: props.store,
      //  list: new immutable.List(),
      //  sortBy,
      //  sortDirection
      //}),
      //selection: EnhancedTable.initSelection(props),
      //oldSelectionMode: props.selectionMode
    };

    this._sort = this._sort.bind(this);
    this.handleSearchChanged = this.handleSearchChanged.bind(this);
    //this._getRowHeight = this._getRowHeight.bind(this);
    this.getRowClassName = this.getRowClassName.bind(this);
    this.cellRenderer = this.cellRenderer.bind(this);
    this.headerRenderer = this.headerRenderer.bind(this);
    this.setSelection = this.setSelection.bind(this);
  }

  currentRecordset;
  currentSelection;
  /*
  static getDerivedStateFromProps(props, state) {
    // Any time the current user changes,
    // Reset any parts of state that are tied to that user.
    // In this simple example, that's just the email.
    if (props.selectionMode !== state.oldSelectionMode) {
      return {
        oldSelectionMode: props.selectionMode,
        selection: EnhancedTable.initSelection(props)
      };
    }
    return null;
  }

  static initSelection(props) {
    const { selectionMode } = props;
    return new ImmutableSelection({
      isEnabled: selectionMode === "single" || selectionMode === "multi",
      isMulti: selectionMode === "multi"
    });
  }
*/
  getActualColumns = memoize((columns, selectionMode, isSelectionEnabled) => {
    const actualColumns = [...columns];
    if (isSelectionEnabled) {
      actualColumns.unshift({
        cellContentRenderer: this.selectionCellRenderer,
        dataKey: selDataKey,
        width: 40,
        disableSort: true
      });
    }
    console.log("columns");
    return actualColumns;
  });

  getActualRecordset = memoize(
    (sourceRecordset, searchPredicate, sortBy, sortDirection) => {
      const partial = searchPredicate
        ? sourceRecordset.filter(searchPredicate)
        : sourceRecordset;
      return partial
        .sortBy(item => item[sortBy])
        .update(list =>
          sortDirection === SortDirection.DESC ? list.reverse() : list
        );
    }
  );

  getActualSelection = memoize(
    (actualRecordset, selectionMode, selectionRequest) => {
      const isEnabled = selectionMode === "single" || selectionMode === "multi";
      const isMulti = selectionMode === "multi";
      const { recs, scrollToIndex } =
        isEnabled && selectionRequest
          ? selectionRequest(
              actualRecordset,
              this.currentSelection.recs,
              isMulti
            )
          : { recs: new immutable.Set() };

      return {
        recs,
        scrollToIndex,
        isEnabled,
        isMulti,
        isPartial: recs.size > 0 && recs.size < actualRecordset.size
      };
    }
  );

  setSelection(selectionRequest) {
    this.setState({ selectionRequest });
  }

  /*
  _sort({ sortBy, sortDirection }) {
    const sortedList = this._sortList({ sortBy, sortDirection });
    this.setState({ sortBy, sortDirection, sortedList });
  }

  _sortList({ sortBy, sortDirection }) {
    const { store } = this.props;
    return store
      .getItems()
      .sortBy(item => item[sortBy])
      .update(list =>
        sortDirection === SortDirection.DESC ? list.reverse() : list
      );
  }
*/
  //_getRowHeight({index}) {
  //  const {sortedList} = this.state;
  //  return sortedList.get(index).size;
  //}

  componentDidMount() {
    //const { store } = this.props;
    //const { sortBy, sortDirection } = this.state;
    //store.load();
    //this._sort({ sortBy, sortDirection });
    //this.setState({
    //  recordset: this.state.recordset.load()
    //});
  }

  getRowClassName = ({ index }) => {
    const { classes, rowClassName, onRowClick } = this.props;
    return classNames(classes.tableRow, classes.flexContainer, rowClassName, {
      [classes.tableRowHover]: index !== -1 && onRowClick != null
    });
  };

  cellRenderer = ({ cellData, columnIndex = null }) => {
    const {
      classes,
      rowHeight,
      onRowClick,
      columns,
      selectionMode
    } = this.props;
    const actualColumns = this.getActualColumns(
      columns,
      selectionMode,
      this.currentSelection.isEnabled
    );
    return (
      <TableCell
        component="div"
        className={classNames(classes.tableCell, classes.flexContainer, {
          [classes.noClick]: onRowClick == null
        })}
        variant="body"
        style={{ height: rowHeight }}
        align={
          (columnIndex != null && actualColumns[columnIndex].numeric) || false
            ? "right"
            : "left"
        }
      >
        {cellData}
      </TableCell>
    );
  };

  headerRenderer = ({
    label,
    columnIndex,
    dataKey,
    sortBy,
    sortDirection,
    sort
  }) => {
    const { headerHeight, classes, columns, selectionMode } = this.props;
    const actualColumns = this.getActualColumns(
      columns,
      selectionMode,
      this.currentSelection.isEnabled
    );
    const direction = {
      [SortDirection.ASC]: "asc",
      [SortDirection.DESC]: "desc"
    };

    const inner =
      !actualColumns[columnIndex].disableSort && sort != null ? (
        <TableSortLabel
          active={dataKey === sortBy}
          direction={direction[sortDirection]}
        >
          {label}
        </TableSortLabel>
      ) : (
        label
      );

    return (
      <TableCell
        component="div"
        className={classNames(
          classes.tableCell,
          classes.flexContainer,
          classes.noClick
        )}
        variant="head"
        style={{ height: headerHeight }}
        align={actualColumns[columnIndex].numeric || false ? "right" : "left"}
      >
        {inner}
      </TableCell>
    );
  };

  rowRenderer = props => {
    return defaultTableRowRenderer({
      ...props,
      onRowClick: this.handleRowClick
    });
  };

  handleRowClick = ({ event, rowData }) => {
    event.stopPropagation();
    //const selection = this.state.selection.toggle(rowData);
    //this.setState({ selection });
    this.setState({
      selectionRequest: SelectToggle(rowData)
    });
  };

  selectionCellRenderer = ({ cellData, columnIndex = null }) => {
    //const { selection } = this.state;
    const { rowData } = cellData;
    return <Checkbox checked={this.currentSelection.recs.has(rowData)} />;
  };

  handleHeaderSelectionCell = event => {
    //const { selection } = this.state;
    if (event.target.checked) {
      //this.setState({ selection: selection.all(this.currentRecordset) });
      this.setState({
        selectionRequest: SelectAll()
      });
    } else {
      this.setState({
        selectionRequest: SelectNone()
      });
      //this.setState({ selection: selection.none() });
    }
  };

  selectionHeaderRenderer = () => {
    //const { selection } = this.state;
    const visibility = this.currentSelection.isMulti ? "visible" : "hidden";
    return (
      <Checkbox
        style={{ visibility }}
        checked={this.currentSelection.recs.size > 0}
        indeterminate={this.currentSelection.isPartial}
        onClick={e => this.handleHeaderSelectionCell(e)}
      />
    );
  };

  columnRenderer = (
    { cellContentRenderer = null, className, dataKey, ...other },
    index
  ) => {
    const { classes } = this.props;
    //const { selection } = this.state;
    let renderer;
    if (index === 0 && this.currentSelection.isEnabled) {
      renderer = cellRendererProps =>
        this.selectionCellRenderer({
          cellData: cellRendererProps,
          columnIndex: index
        });
    } else if (cellContentRenderer != null) {
      renderer = cellRendererProps =>
        this.cellRenderer({
          cellData: cellContentRenderer(cellRendererProps),
          columnIndex: index
        });
    } else {
      renderer = this.cellRenderer;
    }

    return (
      <Column
        key={dataKey}
        headerRenderer={headerProps =>
          index === 0 && this.currentSelection.isEnabled
            ? this.selectionHeaderRenderer({
                ...headerProps,
                columnIndex: index
              })
            : this.headerRenderer({
                ...headerProps,
                columnIndex: index,
                sort: this._sort
              })
        }
        className={classNames(classes.flexContainer, className)}
        cellRenderer={renderer}
        dataKey={dataKey}
        {...other}
      />
    );
  };

  _sort({ sortBy, sortDirection }) {
    this.setState({
      sortBy,
      sortDirection
      //recordset: this.state.recordset.sort(args)
    });
  }

  handleSearchChanged(text) {
    const { searchRule } = this.props;
    const searchPredicate = text && searchRule ? searchRule(text) : null;
    this.setState({
      searchPredicate
      //recordset: this.state.recordset.search(predicate)
    });
  }

  render() {
    const {
      classes,
      getItems,
      columns,
      selectionMode,
      ...tableProps
    } = this.props;
    const {
      searchPredicate,
      sortBy,
      sortDirection,
      selectionRequest
    } = this.state;

    const items = (getItems && getItems()) || new immutable.List();
    this.currentRecordset = this.getActualRecordset(
      items,
      searchPredicate,
      sortBy,
      sortDirection
    );
    this.currentSelection = this.getActualSelection(
      this.currentRecordset,
      selectionMode,
      selectionRequest
    );
    const actualColumns = this.getActualColumns(
      columns,
      selectionMode,
      this.currentSelection.isEnabled
    );
    const rowGetter = ({ index }) => this.currentRecordset.get(index);
    return (
      <div className={classes.root}>
        <EnhancedTableToolbar
          onSearchChange={text => this.handleSearchChanged(text)}
          {...tableProps}
        />
        <div>
          <AutoSizer>
            {({ height, width }) => (
              <Table
                className={classes.table}
                height={height}
                width={width}
                rowGetter={rowGetter}
                rowCount={this.currentRecordset.size}
                sort={this._sort}
                sortBy={sortBy}
                sortDirection={sortDirection}
                headerHeight={56}
                rowHeight={56}
                {...tableProps}
                rowClassName={this.getRowClassName}
                rowRenderer={this.rowRenderer}
                scrollToIndex={this.currentSelection.scrollToIndex}
              >
                {actualColumns.map(this.columnRenderer)}
              </Table>
            )}
          </AutoSizer>
        </div>
        <EnhancedTableFooter
          owner={this}
          selection={this.currentSelection}
          {...tableProps}
        />
      </div>
    );
  }
}

/*
MuiVirtualizedTable.propTypes = {
  classes: PropTypes.object.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      cellContentRenderer: PropTypes.func,
      dataKey: PropTypes.string.isRequired,
      width: PropTypes.number.isRequired
    })
  ).isRequired,
  headerHeight: PropTypes.number,
  onRowClick: PropTypes.func,
  rowClassName: PropTypes.string,
  rowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
  sort: PropTypes.func
};

MuiVirtualizedTable.defaultProps = {
  headerHeight: 56,
  rowHeight: 56
};
*/
export default withStyles(styles)(EnhancedTable);
