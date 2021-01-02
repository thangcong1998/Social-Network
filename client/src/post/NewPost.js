import React, { Component } from "react";

import { create } from "./apiPost";
import { isAuthenticated } from "../auth/Index";
import Loading from "../loading/Loading";
import { Redirect } from "react-router-dom";

class NewPost extends Component {
  constructor() {
    super();
    this.state = {
      title: "",
      body: "",
      photo: "",
      error: "",
      user: {},
      fileSize: 0,
      loading: false,
      redirectToProfile: false,
    };
  }

  componentDidMount() {
    this.postData = new FormData();
    this.setState({ user: isAuthenticated().user });
  }

  isValid = () => {
    const { title, body, fileSize, photo } = this.state;
    if (fileSize > 1000000) {
      this.setState({
        error: "File size should be less than 1 MB",
        loading: false,
      });
      return false;
    }
    if (photo.length === 0) {
      this.setState({ error: "Photo is required", loading: false });
      return false;
    }
    if (title.length === 0) {
      this.setState({ error: "Title is required", loading: false });
      return false;
    }
    if (body.length === 0) {
      this.setState({ error: "Body is required", loading: false });
      return false;
    }
    return true;
  };

  handleChange = (e) => {
    if (e?.target?.files) {
      var reader = new FileReader();
      reader.onload = function () {
        var output = document.getElementById("output_image");
        output.src = reader.result;
      };
      reader.readAsDataURL(e.target?.files[0]);
    }

    const value =
      e.target.name === "photo" ? e.target.files[0] : e.target.value;
    const fileSize = e.target.name === "photo" ? e.target.files[0].size : 0;
    //Form Data method set

    this.postData.set(e.target.name, value);
    this.setState({
      error: "",
      [e.target.name]: value,
      fileSize,
    });
  };

  clickSubmit = (e) => {
    e.preventDefault();
    this.setState({ loading: true });
    if (this.isValid()) {
      const userId = isAuthenticated().user._id;
      const token = isAuthenticated().token;
      create(userId, token, this.postData).then((data) => {
        if (data.error) {
          this.setState({ error: data.error, loading: false });
        } else {
          this.setState({
            title: "",
            body: "",
            photo: "",
            loading: false,
            redirectToProfile: true,
          });
        }
      });
    }
  };

  newPostForm = (title, body, photo) => (
    <form style={{ marginTop: 10 }}>
      <div className="form-group">
        <label className="text-muted">Tiêu đề bài đăng</label>
        <input
          onChange={this.handleChange}
          name="title"
          type="text"
          className="form-control"
          value={title}
        />
      </div>
      <div className="form-group">
        <label className="text-muted">Nội dung</label>
        <textarea
          onChange={this.handleChange}
          type="text"
          name="body"
          className="form-control"
          value={body}
        />
      </div>

      <div className="form-group">
        <label className="text-muted">Ảnh</label>
        <input
          onChange={this.handleChange}
          name="photo"
          type="file"
          accept="image/*"
          className="form-control"
        />
        <img
          id="output_image"
          style={{
            height: 100,
            width: 140,
            // display: ? "flex" : "none",
          }}
        />
      </div>

      <button
        onClick={this.clickSubmit}
        className="btn btn-raised btn-primary"
        style={{ backgroundColor: "#1596f5" }}
      >
        Đăng bài
      </button>
    </form>
  );

  render() {
    const { title, body, user, loading, error, redirectToProfile } = this.state;
    if (redirectToProfile) {
      return <Redirect to={`/user/${user._id}`}></Redirect>;
    }
    return (
      <div className="container">
        <div style={{ display: "flex" }}>
          {isAuthenticated().user?.name && (
            <img
              style={{ height: 40, width: 40, padding: 0, borderRadius: 20 }}
              className="img-thumbnail"
              src={`${process.env.REACT_APP_API_URL}/user/photo/${user?._id}`}
              alt={user?.name}
            />
          )}
          <h3>
            {isAuthenticated().user?.name ? isAuthenticated().user?.name : null}
          </h3>
        </div>

        <div
          className="alert alert-danger"
          style={{ display: error ? "" : "none" }}
        >
          {error}
        </div>
        {loading ? <Loading /> : this.newPostForm(title, body)}
      </div>
    );
  }
}

export default NewPost;
