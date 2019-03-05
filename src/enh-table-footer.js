import React from "react";
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import DeleteIcon from "@material-ui/icons/DeleteTwoTone";
import EditIcon from "@material-ui/icons/Edit";
import AddIcon from "@material-ui/icons/Add";

const styles = theme => ({
  root: {
    paddingRight: theme.spacing.unit,
    borderTopWidth: 1,
    borderTopColor: theme.palette.grey[300],
    borderTopStyle: "solid"
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
  footer: {
    height: theme.spacing.unit * 2,
    borderTopWidth: 1,
    borderTopColor: theme.palette.grey[300],
    borderTopStyle: "solid"
  }
});

const defaultDeleteTitle = "Delete";
const defaultEditTitle = "Edit";
const defaultAddTitle = "Add";

class EnhancedTableFooter extends React.PureComponent {
  constructor(props) {
    super(props);
    this.handleAdd = this.handleAdd.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleAdd = () => {
    const { owner, onAdd, selection } = this.props;
    if (onAdd) {
      onAdd({ owner, selection: selection.recs });
    }
  };

  handleEdit = () => {
    const { owner, onEdit, selection } = this.props;
    if (onEdit) {
      onEdit({ owner, selection: selection.recs });
    }
  };

  handleDelete = () => {
    const { owner, onDelete, selection } = this.props;
    if (onDelete) {
      onDelete({ owner, selection: selection.recs });
    }
  };

  render() {
    const {
      selection,
      classes,
      deleteAllowed,
      deleteDisabled,
      deleteTitle,
      editAllowed,
      editDisabled,
      editTitle,
      addAllowed,
      addDisabled,
      addTitle
    } = this.props;

    const actualDeleteTitle = deleteTitle || defaultDeleteTitle;
    const actualEditTitle = editTitle || defaultEditTitle;
    const actualAddTitle = addTitle || defaultAddTitle;

    var showToolbar = false;
    if (addAllowed) {
      showToolbar = true;
    } else if ((deleteAllowed || editAllowed) && selection.isEnabled) {
      showToolbar = true;
    } else if (selection.isMulti) {
      showToolbar = true;
    }
    if (showToolbar) {
      return (
        <Toolbar className={classes.root}>
          <div className={classes.title}>
            {selection.recs.size > 0 && (
              <Typography color="primary" variant="subtitle1">
                {selection.recs.size} selected
              </Typography>
            )}
          </div>
          <div className={classes.spacer}>
            {deleteAllowed && selection.recs.size > 0 && (
              <Tooltip title={actualDeleteTitle}>
                <IconButton
                  disabled={deleteDisabled}
                  onClick={() => this.handleDelete()}
                  aria-label={actualDeleteTitle}
                >
                  <DeleteIcon color="secondary" />
                </IconButton>
              </Tooltip>
            )}
          </div>
          <div className={classes.actions}>
            {editAllowed && selection.recs.size === 1 && (
              <Tooltip title={actualEditTitle}>
                <IconButton
                  disabled={editDisabled}
                  onClick={() => this.handleEdit()}
                  aria-label={actualEditTitle}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
            {addAllowed && (
              <Tooltip title={actualAddTitle}>
                <IconButton
                  disabled={addDisabled}
                  aria-label={actualAddTitle}
                  onClick={() => this.handleAdd()}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            )}
          </div>
        </Toolbar>
      );
    } else {
      return <div className={classes.footer} />;
    }
  }
}

export default withStyles(styles)(EnhancedTableFooter);
