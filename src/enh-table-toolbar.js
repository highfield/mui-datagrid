//see: https://material-ui.com/demos/tables/

import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import SearchIcon from "@material-ui/icons/Search";
import FilterListIcon from "@material-ui/icons/FilterList";
import EnhancedTableSearch from "./enh-table-search";

const styles = theme => ({
  root: {
    paddingRight: theme.spacing.unit
  },
  spacer: {
    flex: "1 1 100%"
  },
  actions: {
    display: "flex",
    color: theme.palette.text.secondary
  },
  title: {
    flex: "0 0 auto"
  },
  header: {}
});

const defaultSearchTitle = "Search";

class EnhancedTableToolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchVisible: false
    };
  }

  handleShowSearch() {
    this.setState({
      searchVisible: !this.state.searchVisible
    });
    this.handleSearchChanged("");
  }

  handleHideSearch() {
    this.setState({
      searchVisible: false
    });
    this.handleSearchChanged("");
  }

  handleSearchChanged(text) {
    const { onSearchChange } = this.props;
    if (onSearchChange) {
      if (!this.state.searchVisible) text = "";
      onSearchChange(text);
    }
  }

  render() {
    const { classes, title, searchAllowed, searchTitle } = this.props;

    const actualSearchTitle = searchTitle || defaultSearchTitle;

    var showToolbar = false;
    if (searchAllowed || title) {
      showToolbar = true;
    }
    if (showToolbar) {
      return (
        <Toolbar className={classes.root}>
          <div className={classes.title}>
            {this.state.searchVisible ? (
              <EnhancedTableSearch
                onHide={() => this.handleHideSearch()}
                onSearchChange={text => this.handleSearchChanged(text)}
              />
            ) : (
              <Typography variant="h6" id="tableTitle">
                {title}
              </Typography>
            )}
          </div>
          <div className={classes.spacer} />
          <div className={classes.actions}>
            {searchAllowed && (
              <Tooltip title={actualSearchTitle}>
                <IconButton
                  aria-label={actualSearchTitle}
                  onClick={() => this.handleShowSearch()}
                >
                  <SearchIcon />
                </IconButton>
              </Tooltip>
            )}
          </div>
        </Toolbar>
      );
    } else {
      return <div className={classes.header} />;
    }
  }
}

/* EnhancedTableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired
};
 */
export default withStyles(styles)(EnhancedTableToolbar);
