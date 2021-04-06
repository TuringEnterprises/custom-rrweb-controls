import React, { useEffect } from "react";

export const UserForm = (props) => {
  let events = [];
  useEffect(() => {
    let stopFn = window.rrweb.record({
      emit(event) {
        if (events.length > 150) {
          stopFn();
        }

        events.push(event);
      },
    });
  }, []);

  const onSave = () => {
    window.localStorage.removeItem("eventArr");
    window.localStorage.setItem("eventArr", JSON.stringify(events));
  };

  return (
    <div>
      <h1>User Detail Form</h1>
      <form>
        <div className="form-control">
          <label>First Name</label>
          <input type="text" />
        </div>
        <div className="form-control">
          <label>Middle Name</label>
          <input type="text" />
        </div>
        <div className="form-control">
          <label>Last Name</label>
          <input type="text" />
        </div>
        <div className="form-control">
          <label>Date of birth</label>
          <input type="dob" />
        </div>
        <div>
          <button>Submit</button>
        </div>
      </form>
      <button onClick={onSave}>Save</button>
    </div>
  );
};
