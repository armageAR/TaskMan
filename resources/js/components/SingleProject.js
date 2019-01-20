import axios from "axios";
import React, { Component } from "react";
import Toggle from "react-toggle";

class SingleProject extends Component {
    constructor(props) {
        super(props);
        this.state = {
            project: {},
            tasks: [],
            title: "",
            errors: [],
            onlyPending: false
        };
        this.handleMarkProjectAsCompleted = this.handleMarkProjectAsCompleted.bind(
            this
        );
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.handleAddNewTask = this.handleAddNewTask.bind(this);
        this.hasErrorFor = this.hasErrorFor.bind(this);
        this.renderErrorFor = this.renderErrorFor.bind(this);
        this.handleTaskStatusChange = this.handleTaskStatusChange.bind(this);
        this.showTasks = this.showTasks.bind(this);
        this.handleMarkTaskAsCompleted = this.handleMarkTaskAsCompleted.bind(
            this
        );
    }

    componentDidMount() {
        const projectId = this.props.match.params.id;

        axios.get(`/api/projects/${projectId}`).then(response => {
            this.setState({
                project: response.data,
                tasks: response.data.tasks
            });
        });
    }

    handleMarkProjectAsCompleted() {
        const { history } = this.props;

        axios
            .put(`/api/projects/${this.state.project.id}`)
            .then(response => history.push("/"));
    }

    // Tasks methods
    handleFieldChange(event) {
        this.setState({
            title: event.target.value
        });
    }

    handleAddNewTask(event) {
        event.preventDefault();

        const task = {
            title: this.state.title,
            project_id: this.state.project.id
        };

        axios
            .post("/api/tasks", task)
            .then(response => {
                // clear form input
                this.setState({
                    title: ""
                });
                // add new task to list of tasks
                this.setState(prevState => ({
                    tasks: prevState.tasks.concat(response.data)
                }));
            })
            .catch(error => {
                this.setState({
                    errors: error.response.data.errors
                });
            });
    }

    hasErrorFor(field) {
        return !!this.state.errors[field];
    }

    renderErrorFor(field) {
        if (this.hasErrorFor(field)) {
            return (
                <span className="invalid-feedback">
                    <strong>{this.state.errors[field][0]}</strong>
                </span>
            );
        }
    }
    handleMarkTaskAsCompleted(taskId) {
        axios.put(`/api/tasks/${taskId}`).then(response => {
            var index = this.state.tasks.findIndex(task => task.id === taskId);
            this.setState({
                tasks: [
                    ...this.state.tasks.slice(0, index),
                    Object.assign({}, this.state.tasks[index], {
                        is_completed: true
                    }),
                    ...this.state.tasks.slice(index + 1)
                ]
            });
        });
    }
    //END TASK METHODS

    handleBackHome() {
        const { history } = this.props;
        history.push("/");
    }

    //////////////////////////////////////
    handleTaskStatusChange(e) {
        // if (!e.target.checked) {
        //     this.setState({ onlyPending: true });
        // } else {
        //     this.setState({ onlyPending: false });
        // }
        this.state.onlyPending = !this.state.onlyPending;
    }
    showTasks(tasksList) {
        if (this.state.onlyPending == false) {
            return tasksList.map(task => (
                <li
                    className="list-group-item d-flex justify-content-between align-items-center"
                    key={task.id}
                >
                    <span>{task.title}</span>
                    <TaskStatus status={task.is_completed} />
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={this.handleMarkTaskAsCompleted.bind(
                            this,
                            task.id
                        )}
                    >
                        Mark as completed
                    </button>
                </li>
            ));
            // } else {
            //     return tasksList.map(task => {
            //         if (task.is_completed) {
            //             return (
            //                 <li
            //                     className="list-group-item d-flex justify-content-between align-items-center"
            //                     key={task.id}
            //                 >
            //                     <span>{task.title}</span>
            //                     <TaskStatus status={task.is_completed} />
            //                     {/* <button
            //                         className="btn btn-primary btn-sm"
            //                         onClick={this.handleMarkTaskAsCompleted.bind(
            //                             task.id
            //                         )}
            //                     >
            //                         Mark as completed
            //                     </button> */}
            //                 </li>
            //             );
            //         }
            //     });
        }
    }
    render() {
        const { project, tasks } = this.state;
        if (!this.state.project.name) {
            return (
                <div className="container py-4">
                    <div className="row justify-content-center">
                        <div className="col-md-8">
                            <div className="card text-center p-5">
                                <div id="loading" />
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <div className="container py-4">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-header">{project.name}</div>
                            <div className="card-body">
                                <p>{project.description}</p>
                                <button
                                    className="btn btn-success mr-3 btn-sm"
                                    onClick={this.handleBackHome.bind(this)}
                                >
                                    Back
                                </button>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={this.handleMarkProjectAsCompleted}
                                >
                                    Mark as completed
                                </button>

                                <div className="mt-1 float-right">
                                    <span>Only Pending &nbsp;&nbsp;</span>
                                    <Toggle
                                        defaultChecked={this.state.onlyPending}
                                        onChange={this.handleTaskStatusChange}
                                    />
                                </div>

                                <hr />
                                <form onSubmit={this.handleAddNewTask}>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            name="title"
                                            className={`form-control ${
                                                this.hasErrorFor("title")
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            placeholder="Task title"
                                            value={this.state.title}
                                            onChange={this.handleFieldChange}
                                        />
                                        <div className="input-group-append">
                                            <button className="btn btn-primary">
                                                Add
                                            </button>
                                        </div>
                                        {this.renderErrorFor("title")}
                                    </div>
                                </form>
                                <ul className="list-group mt-3">
                                    {this.showTasks(this.state.tasks)}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
class TaskStatus extends React.Component {
    constructor(props) {
        super();
    }
    render() {
        if (this.props.status) {
            return <span className="badge badge-success">Completed</span>;
        } else {
            return <span className="badge badge-danger">Pending</span>;
        }
    }
}

export default SingleProject;
