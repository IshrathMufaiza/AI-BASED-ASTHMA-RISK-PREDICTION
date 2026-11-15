import { Link } from "react-router-dom";

function PatientTable({
  patients,
  searchTerm,
}) {

  const filteredPatients =
    patients.filter((patient) =>
      patient.name
        .toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )
    );

  return (
    <div className="table-container">

      <table className="patient-table">

        <thead>

          <tr>
            <th>Patient</th>
            <th>Age</th>
            <th>Action</th>
          </tr>

        </thead>

        <tbody>

          {filteredPatients.length === 0 ? (

            <tr>

              <td
                colSpan="4"
                className="no-results"
              >

                <div
                  style={{
                    fontSize: "45px",
                  }}
                >
                  🔍
                </div>

                <h3>
                  No matching patients
                </h3>

                <p>
                  Try another patient name.
                </p>

              </td>

            </tr>

          ) : (

            filteredPatients.map((patient) => (

              <tr key={patient._id}>

                <td>

                  <div className="patient-name">

                    👤

                    <div>

                      <strong>
                        {patient.name}
                      </strong>

                      <br />

                      <small>
                        {patient.email}
                      </small>

                    </div>

                  </div>

                </td>

                <td>

                  {patient.age || "--"} yrs

                </td>

                

                <td>

                  <Link
                    to={`/patients/${patient._id}`}
                  >

                    <button className="view-button">

                      View Details →

                    </button>

                  </Link>

                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </div>
  );
}

export default PatientTable;