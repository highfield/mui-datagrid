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
      selectionRequest: null,
      searchPredicate: null,
      sortBy: "",
      sortDirection: SortDirection.ASC
    };

    this.handleSort = this.handleSort.bind(this);
    this.handleSearchChanged = this.handleSearchChanged.bind(this);
    this.getRowClassName = this.getRowClassName.bind(this);
    this.cellRenderer = this.cellRenderer.bind(this);
    this.headerRenderer = this.headerRenderer.bind(this);
    this.setSelection = this.setSelection.bind(this);
  }

  recordset = new immutable.List();
  actualColumns = [];
  selection = {
    recs: new immutable.Set()
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
      if (!sourceRecordset) sourceRecordset = new immutable.List();
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
          ? selectionRequest(actualRecordset, this.selection.recs, isMulti)
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

  setSelection = selectionRequest => {
    this.setState({ selectionRequest });
  };

  getRowClassName = ({ index }) => {
    const { classes, rowClassName, onRowClick } = this.props;
    return classNames(classes.tableRow, classes.flexContainer, rowClassName, {
      [classes.tableRowHover]: index !== -1 && onRowClick != null
    });
  };

  cellRenderer = ({ cellData, columnIndex = null }) => {
    const { classes, rowHeight, onRowClick } = this.props;

    return (
      <TableCell
        component="div"
        className={classNames(classes.tableCell, classes.flexContainer, {
          [classes.noClick]: onRowClick == null
        })}
        variant="body"
        style={{ height: rowHeight }}
        align={
          (columnIndex != null && this.actualColumns[columnIndex].numeric) ||
          false
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

    const direction = {
      [SortDirection.ASC]: "asc",
      [SortDirection.DESC]: "desc"
    };

    const inner =
      !this.actualColumns[columnIndex].disableSort && sort != null ? (
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
        align={
          this.actualColumns[columnIndex].numeric || false ? "right" : "left"
        }
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
    return <Checkbox checked={this.selection.recs.has(rowData)} />;
  };

  handleHeaderSelectionCell = event => {
    this.setSelection(event.target.checked ? SelectAll() : SelectNone());
  };

  selectionHeaderRenderer = () => {
    const visibility = this.selection.isMulti ? "visible" : "hidden";
    return (
      <Checkbox
        style={{ visibility }}
        checked={this.selection.recs.size > 0}
        indeterminate={this.selection.isPartial}
        onClick={e => this.handleHeaderSelectionCell(e)}
      />
    );
  };

  columnRenderer = (
    { cellContentRenderer = null, className, dataKey, ...other },
    index
  ) => {
    const { classes } = this.props;
    let renderer;
    if (index === 0 && this.selection.isEnabled) {
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
          index === 0 && this.selection.isEnabled
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
    this.setState({ sortBy, sortDirection });
  }

  handleSearchChanged(text) {
    const { searchRule } = this.props;
    this.setState({
      searchPredicate: text && searchRule ? searchRule(text) : null
    });
  }

  render() {
    const {
      classes,
      items,
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

    this.recordset = this.getActualRecordset(
      items,
      searchPredicate,
      sortBy,
      sortDirection
    );
    this.selection = this.getActualSelection(
      this.recordset,
      selectionMode,
      selectionRequest
    );
    this.actualColumns = this.getActualColumns(
      columns,
      selectionMode,
      this.selection.isEnabled
    );

    const rowGetter = ({ index }) => this.recordset.get(index);

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
                rowCount={this.recordset.size}
                sort={this.handleSort}
                sortBy={sortBy}
                sortDirection={sortDirection}
                headerHeight={56}
                rowHeight={56}
                {...tableProps}
                rowClassName={this.getRowClassName}
                rowRenderer={this.rowRenderer}
                scrollToIndex={this.selection.scrollToIndex}
              >
                {this.actualColumns.map(this.columnRenderer)}
              </Table>
            )}
          </AutoSizer>
        </div>
        <EnhancedTableFooter
          owner={this}
          selection={this.selection}
          {...tableProps}
        />
      </div>
    );
  }
}

export default withStyles(styles)(EnhancedTable);
