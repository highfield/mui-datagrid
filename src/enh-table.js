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
import immutable from "immutable";
import memoize from "memoize-one";

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

    this.state = {
      recordset: new immutable.List(),
      actualColumns: [],
      selection: {
        recs: new immutable.Set()
      }
    };

    this.handleSort = this.handleSort.bind(this);
    this.handleSearchChanged = this.handleSearchChanged.bind(this);
    this.getRowClassName = this.getRowClassName.bind(this);
    this.cellRenderer = this.cellRenderer.bind(this);
    this.headerRenderer = this.headerRenderer.bind(this);
    this.setSelection = this.setSelection.bind(this);
    this.triggerUpdate = this.triggerUpdate.bind(this);
    this.updateState = this.updateState.bind(this);
  }

  tmr = 0;
  cache = {
    selectionMode: null,
    selectionRequest: null,
    searchPredicate: null,
    sortBy: "",
    sortDirection: SortDirection.ASC
  };

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
              this.state.selection.recs,
              isMulti
            )
          : { recs: new immutable.Set() };

      const selection = {
        recs,
        scrollToIndex,
        isEnabled,
        isMulti,
        isPartial: recs.size > 0 && recs.size < actualRecordset.size
      };

      if (isEnabled) {
        const { onSelectionChanged } = this.props;
        if (onSelectionChanged) {
          onSelectionChanged({ sender: this, selection });
        }
      }

      return selection;
    }
  );

  updateState() {
    const { getItems, columns } = this.props;

    const {
      searchPredicate,
      sortBy,
      sortDirection,
      selectionMode,
      selectionRequest
    } = this.cache;

    const items = (getItems && getItems()) || new immutable.List();
    const recordset = this.getActualRecordset(
      items,
      searchPredicate,
      sortBy,
      sortDirection
    );
    const selection = this.getActualSelection(
      recordset,
      selectionMode,
      selectionRequest
    );
    const actualColumns = this.getActualColumns(
      columns,
      selectionMode,
      selection.isEnabled
    );
    this.setState({
      recordset,
      actualColumns,
      selection
    });
  }

  triggerUpdate() {
    if (this.tmr) clearTimeout(this.tmr);
    this.tmr = setTimeout(() => {
      this.tmr = 0;
      this.updateState();
    }, 50);
  }

  componentDidMount() {
    this.triggerUpdate();
  }

  setSelection(selectionRequest) {
    this.cache.selectionRequest = selectionRequest;
    this.triggerUpdate();
  }

  getRowClassName = ({ index }) => {
    const { classes, rowClassName, onRowClick } = this.props;
    return classNames(classes.tableRow, classes.flexContainer, rowClassName, {
      [classes.tableRowHover]: index !== -1 && onRowClick != null
    });
  };

  cellRenderer = ({ cellData, columnIndex = null }) => {
    const { classes, rowHeight, onRowClick } = this.props;

    const { actualColumns } = this.state;

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
    const { headerHeight, classes } = this.props;

    const { actualColumns } = this.state;

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
    this.setSelection(SelectToggle(rowData));
  };

  selectionCellRenderer = ({ cellData, columnIndex = null }) => {
    const { rowData } = cellData;
    const { selection } = this.state;
    return <Checkbox checked={selection.recs.has(rowData)} />;
  };

  handleHeaderSelectionCell = event => {
    this.setSelection(event.target.checked ? SelectAll() : SelectNone());
  };

  selectionHeaderRenderer = () => {
    const { selection } = this.state;
    const visibility = selection.isMulti ? "visible" : "hidden";
    return (
      <Checkbox
        style={{ visibility }}
        checked={selection.recs.size > 0}
        indeterminate={selection.isPartial}
        onClick={e => this.handleHeaderSelectionCell(e)}
      />
    );
  };

  columnRenderer = (
    { cellContentRenderer = null, className, dataKey, ...other },
    index
  ) => {
    const { classes } = this.props;
    const { selection } = this.state;
    let renderer;
    if (index === 0 && selection.isEnabled) {
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
          index === 0 && selection.isEnabled
            ? this.selectionHeaderRenderer({
                ...headerProps,
                columnIndex: index
              })
            : this.headerRenderer({
                ...headerProps,
                columnIndex: index,
                sort: this.handleSort
              })
        }
        className={classNames(classes.flexContainer, className)}
        cellRenderer={renderer}
        dataKey={dataKey}
        {...other}
      />
    );
  };

  handleSort({ sortBy, sortDirection }) {
    this.cache.sortBy = sortBy;
    this.cache.sortDirection = sortDirection;
    this.triggerUpdate();
  }

  handleSearchChanged(text) {
    const { searchRule } = this.props;
    this.cache.searchPredicate = text && searchRule ? searchRule(text) : null;
    this.triggerUpdate();
  }

  render() {
    const {
      classes,
      getItems,
      columns,
      selectionMode,
      ...tableProps
    } = this.props;

    if (selectionMode !== this.cache.selectionMode) {
      this.cache.selectionMode = selectionMode;
      this.triggerUpdate();
    }

    const { recordset, actualColumns, selection } = this.state;

    const { sortBy, sortDirection } = this.cache;

    const rowGetter = ({ index }) => recordset.get(index);

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
                rowCount={recordset.size}
                sort={this.handleSort}
                sortBy={sortBy}
                sortDirection={sortDirection}
                headerHeight={56}
                rowHeight={56}
                {...tableProps}
                rowClassName={this.getRowClassName}
                rowRenderer={this.rowRenderer}
                scrollToIndex={selection.scrollToIndex}
              >
                {actualColumns.map(this.columnRenderer)}
              </Table>
            )}
          </AutoSizer>
        </div>
        <EnhancedTableFooter
          owner={this}
          selection={selection}
          {...tableProps}
        />
      </div>
    );
  }
}

export default withStyles(styles)(EnhancedTable);
