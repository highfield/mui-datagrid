/* eslint-disable no-console */

import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";
import EnhancedTable from "./enh-table";
import Store from "./store";
import immutable from "immutable";
import { SelectSet, SelectNone } from "./enh-table-utils";
//import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const styles = theme => ({
  tablePaper: {
    width: "100%",
    height: 400
  },
  demoPaper: {
    display: "flex",
    flexWrap: "wrap",
    marginTop: theme.spacing.unit * 2,
    padding: theme.spacing.unit * 2
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    minWidth: 120
  },
  table2: {
    flexGrow: 1
  }
});

const store = new Store();

const columns = [
  {
    width: 200,
    flexGrow: 1.0,
    label: "Title",
    dataKey: "title"
  },
  {
    width: 200,
    label: "Author",
    dataKey: "author"
  },
  {
    width: 150,
    label: "Country",
    dataKey: "country"
  },
  {
    width: 100,
    label: "Year",
    dataKey: "year",
    numeric: true
  }
];

class Store2 {
  constructor() {
    this.load = this.load.bind(this);
    this.getItems = this.getItems.bind(this);
  }

  rows = [];
  getItems() {
    return new immutable.List(this.rows);
  }

  add(data) {}
  remove(data) {}
  load() {}
}

const store2 = new Store2();

const searchRule = text => {
  const re = new RegExp(text, "i");
  return value => re.test(value.title) || re.test(value.author);
};

class ReactVirtualizedTable extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      title: "Table title",
      selectionMode: "none",
      searchAllowed: false,
      addAllowed: false,
      editAllowed: false,
      deleteAllowed: false
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    store.load();
    this.forceUpdate();
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleCheck = name => event => {
    this.setState({ [name]: event.target.checked });
  };

  handleText = name => event => {
    this.setState({ [name]: event.target.value });
  };

  handleAdd({ sender, selection }) {
    const rec = {
      title: "Title #" + (store.getItems().size + 1),
      author: "Author",
      country: "Italy",
      year: 2019
    };
    store.add(rec);
    sender.setSelection(SelectSet(rec));
  }

  handleEdit({ sender, selection }) {}

  handleDelete({ sender, selection }) {
    store.delete(selection);
    sender.setSelection(SelectNone());
  }

  handleSelectionChanged({ sender, selection }) {
    console.log("selected=" + selection.recs.size);
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <Paper className={classes.tablePaper}>
          <EnhancedTable
            items={store.getItems()}
            columns={columns}
            selectionMode={this.state.selectionMode}
            title={this.state.title}
            searchAllowed={this.state.searchAllowed}
            addAllowed={this.state.addAllowed}
            editAllowed={this.state.editAllowed}
            deleteAllowed={this.state.deleteAllowed}
            searchRule={searchRule}
            onAdd={args => this.handleAdd(args)}
            onEdit={args => this.handleEdit(args)}
            onDelete={args => this.handleDelete(args)}
            onRowClick={event => console.log(event)}
            onSelectionChanged={args => this.handleSelectionChanged(args)}
          />
        </Paper>

        <Paper className={classes.demoPaper}>
          <form>
            <FormGroup>
              <TextField
                label="Title"
                className={classes.textField}
                value={this.state.title}
                onChange={this.handleText("title")}
                margin="normal"
              />
              <FormControl className={classes.formControl}>
                <InputLabel htmlFor="selectionMode-helper">
                  Selection mode
                </InputLabel>
                <Select
                  value={this.state.selectionMode}
                  onChange={this.handleChange}
                  input={
                    <Input name="selectionMode" id="selectionMode-helper" />
                  }
                >
                  <MenuItem value="none">None</MenuItem>
                  <MenuItem value="single">Single</MenuItem>
                  <MenuItem value="multi">Multi</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.searchAllowed}
                    onChange={this.handleCheck("searchAllowed")}
                    value="searchAllowed"
                  />
                }
                label="Allow search"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.addAllowed}
                    onChange={this.handleCheck("addAllowed")}
                    value="addAllowed"
                  />
                }
                label="Allow add"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.editAllowed}
                    onChange={this.handleCheck("editAllowed")}
                    value="editAllowed"
                  />
                }
                label="Allow edit"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.deleteAllowed}
                    onChange={this.handleCheck("deleteAllowed")}
                    value="deleteAllowed"
                  />
                }
                label="Allow delete"
              />
            </FormGroup>
          </form>
          <div className={classes.table2}>
            <EnhancedTable store={store2} columns={columns} />
          </div>
        </Paper>
      </div>
    );
  }
}

export default withStyles(styles)(ReactVirtualizedTable);
