//see: https://github.com/Diaver/material-datatable/blob/master/src/MaterialDatatableSearch.js

import React from "react";
import Grow from "@material-ui/core/Grow";
import TextField from "@material-ui/core/TextField";
import SearchIcon from "@material-ui/icons/Search";
import IconButton from "@material-ui/core/IconButton";
import ClearIcon from "@material-ui/icons/Clear";
import { withStyles } from "@material-ui/core/styles";

const styles = {
  main: {
    display: "flex",
    flex: "1 0 auto"
  },
  searchIcon: {
    marginTop: "10px",
    marginRight: "8px"
  },
  searchText: {
    flex: "0.8 0"
  },
  clearIcon: {
    "&:hover": {
      color: "#FF0000"
    }
  }
};

class EnhancedTableSearch extends React.Component {
  constructor(props) {
    super(props);
    this.tmr = 0;
  }

  handleTextChange = event => {
    const { onSearchChange } = this.props;
    if (onSearchChange) {
      const value = event.target.value;
      if (this.tmr) clearInterval(this.tmr);
      this.tmr = setTimeout(() => {
        this.tmr = 0;
        onSearchChange(value);
      }, 500);
    }
  };

  componentDidMount() {
    document.addEventListener("keydown", this.onKeyDown, false);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.onKeyDown, false);
  }

  onKeyDown = event => {
    if (event.keyCode === 27) {
      this.props.onHide();
    }
  };

  render() {
    const { classes, onHide } = this.props;

    return (
      <Grow appear in={true} timeout={300}>
        <div className={classes.main} ref={el => (this.rootRef = el)}>
          <SearchIcon className={classes.searchIcon} />
          <TextField
            className={classes.searchText}
            value={
              this.props.searchText !== null && this.props.searchText !== null
                ? this.props.searchText
                : ""
            }
            autoFocus={true}
            InputProps={{
              "aria-label": "search"
            }}
            onChange={this.handleTextChange}
            fullWidth={true}
            inputRef={el => (this.searchField = el)}
          />
          <IconButton className={classes.clearIcon} onClick={onHide}>
            <ClearIcon />
          </IconButton>
        </div>
      </Grow>
    );
  }
}

export default withStyles(styles)(EnhancedTableSearch);
