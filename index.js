const GRAPHQL_URL = "http://localhost:5002/graphql";

let editModal;
let appointmentsModal;
let calendarModal;
let calendarDayModal;

let allPatients = [];

let allCalendarAppointments = [];

let calendarDate = new Date();

let selectedCalendarDate = null;


// ============================================================
// GRAPHQL
// ============================================================

const graphqlRequest = async (
    query,
    variables = {}
) => {

    const response = await fetch(
        GRAPHQL_URL,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                query,
                variables,
            }),
        }
    );


    const result =
        await response.json();


    if (!response.ok) {

        throw new Error(
            "Erro HTTP na requisição GraphQL"
        );
    }


    if (result.errors) {

        console.error(
            "Erros GraphQL:",
            result.errors
        );


        throw new Error(
            result.errors
                .map(
                    (error) => error.message
                )
                .join(", ")
        );
    }


    return result.data;
};


// ============================================================
// LOADING
// ============================================================

const setLoading = (
    isLoading
) => {

    const loadingIndicator =
        document.getElementById(
            "loading-indicator"
        );


    const cardsContainer =
        document.getElementById(
            "cards-container"
        );


    if (loadingIndicator) {

        loadingIndicator.classList.toggle(
            "d-none",
            !isLoading
        );
    }


    if (cardsContainer) {

        cardsContainer.classList.toggle(
            "d-none",
            isLoading
        );
    }
};


// ============================================================
// PACIENTES
// ============================================================

const getPatients = async () => {

    setLoading(true);


    try {

        const query = `
            query {

                patients {

                    patient_id
                    name
                    birth_date
                    tax_id
                    phone
                    email
                    total_appointments

                }
            }
        `;


        const data =
            await graphqlRequest(
                query
            );


        allPatients =
            data.patients || [];


        applyFilter();


    } catch (error) {

        console.error(
            "Erro ao buscar pacientes:",
            error
        );


        showMessageIn(
            document.getElementById(
                "form-message"
            ),
            error.message,
            "danger"
        );


    } finally {

        setLoading(false);
    }
};


// ============================================================
// FILTRO
// ============================================================

const applyFilter = () => {

    const filterInput =
        document.getElementById(
            "input-filter-name"
        );


    if (!filterInput) {
        return;
    }


    const term =
        filterInput.value
            .trim()
            .toLowerCase();


    const filtered =
        term
            ? allPatients.filter(
                (patient) =>
                    (patient.name || "")
                        .toLowerCase()
                        .includes(term)
            )
            : allPatients;


    renderPatients(filtered);
};


// ============================================================
// RENDERIZAÇÃO DOS PACIENTES
// ============================================================

const renderPatients = (
    patients
) => {

    const container =
        document.getElementById(
            "cards-container"
        );


    const emptyMessage =
        document.getElementById(
            "empty-message"
        );


    if (
        !container ||
        !emptyMessage
    ) {
        return;
    }


    container.innerHTML = "";


    if (!patients.length) {

        emptyMessage.classList.remove(
            "d-none"
        );

        return;
    }


    emptyMessage.classList.add(
        "d-none"
    );


    patients.forEach(
        (patient) => {

            const col =
                document.createElement(
                    "div"
                );


            col.className =
                "col-md-6 col-lg-4";


            const totalAppointments =
                patient.total_appointments ?? 0;


            const patientField = (
                label,
                value
            ) => {

                if (
                    value === null ||
                    value === undefined ||
                    String(value).trim() === ""
                ) {
                    return "";
                }


                return `
                    <div class="patient-field">
                        <strong>${label}:</strong>
                        ${value}
                    </div>
                `;
            };


            col.innerHTML = `

                <div class="patient-card">

                    <div class="d-flex justify-content-between align-items-start">

                        <h5>
                            ${patient.name ?? ""}
                        </h5>

                        <span class="badge bg-primary badge-appointments">
                            #${patient.patient_id}
                        </span>

                    </div>


                    ${patientField(
                        "Nascimento",
                        patient.birth_date
                    )}


                    ${patientField(
                        "CPF",
                        patient.tax_id
                    )}


                    ${patientField(
                        "Telefone",
                        patient.phone
                    )}


                    ${patientField(
                        "E-mail",
                        patient.email
                    )}


                    ${patientField(
                        "CEP",
                        patient.cep
                    )}


                    ${patientField(
                        "Logradouro",
                        patient.logradouro
                    )}


                    ${patientField(
                        "Complemento",
                        patient.complemento
                    )}


                    ${patientField(
                        "Bairro",
                        patient.bairro
                    )}


                    ${patientField(
                        "Cidade",
                        patient.localidade
                    )}


                    ${patientField(
                        "UF",
                        patient.uf
                    )}


                    ${patientField(
                        "Profissão",
                        patient.profession
                    )}


                    <div class="patient-field">

                        <strong>
                            Consultas:
                        </strong>

                        ${totalAppointments}

                    </div>


                    <div class="mt-3 d-flex gap-2">

                        <button
                            type="button"
                            class="btn btn-sm btn-outline-primary flex-fill"
                            data-action="edit">

                            Editar

                        </button>


                        <button
                            type="button"
                            class="btn btn-sm btn-outline-success flex-fill"
                            data-action="appointments">

                            Consultas

                        </button>


                        <button
                            type="button"
                            class="btn btn-sm btn-danger flex-fill"
                            data-action="delete">

                            Excluir

                        </button>

                    </div>

                </div>
            `;


            // ------------------------------------------------
            // EDITAR
            // ------------------------------------------------

            const editButton =
                col.querySelector(
                    '[data-action="edit"]'
                );


            editButton.addEventListener(
                "click",
                () => {

                    openEditModal(
                        patient
                    );
                }
            );


            // ------------------------------------------------
            // CONSULTAS
            // ------------------------------------------------

            const appointmentsButton =
                col.querySelector(
                    '[data-action="appointments"]'
                );


            appointmentsButton.addEventListener(
                "click",
                () => {

                    openAppointmentsModal(
                        patient
                    );
                }
            );


            // ------------------------------------------------
            // EXCLUIR
            // ------------------------------------------------

            const deleteButton =
                col.querySelector(
                    '[data-action="delete"]'
                );


            deleteButton.addEventListener(
                "click",
                () => {

                    deletePatient(
                        patient.patient_id
                    );
                }
            );


            container.appendChild(
                col
            );
        }
    );
};


// ============================================================
// BUSCAR PACIENTE POR ID
// ============================================================

const searchPatientById = async () => {

    const searchId =
        document.getElementById(
            "input-search-id"
        ).value.trim();


    const searchMessage =
        document.getElementById(
            "search-message"
        );


    const resultBox =
        document.getElementById(
            "search-result"
        );


    if (!searchId) {

        showMessageIn(
            searchMessage,
            "Digite um ID para buscar",
            "danger"
        );


        resultBox.classList.add(
            "d-none"
        );


        return;
    }


    setLoading(true);


    try {

        const query = `
            query GetPatient(
                $id: ID!
            ) {

                patient(
                    id: $id
                ) {

                    patient_id
                    name
                    birth_date
                    tax_id
                    phone
                    email

                    cep
                    logradouro
                    complemento
                    bairro
                    localidade
                    uf

                    profession

                    appointments {

                        appointment_id
                        patient_id
                        date
                        reason
                        notes

                    }
                }
            }
        `;


        const data =
            await graphqlRequest(
                query,
                {
                    id: searchId,
                }
            );


        const patient =
            data.patient;


        if (!patient) {

            showMessageIn(
                searchMessage,
                "Paciente não encontrado",
                "danger"
            );


            resultBox.classList.add(
                "d-none"
            );


            return;
        }


        showMessageIn(
            searchMessage,
            `Paciente #${patient.patient_id} encontrado`,
            "success"
        );


        renderSearchResult(
            patient
        );


    } catch (error) {

        console.error(
            "Erro ao buscar paciente:",
            error
        );


        showMessageIn(
            searchMessage,
            error.message,
            "danger"
        );


        resultBox.classList.add(
            "d-none"
        );


    } finally {

        setLoading(false);
    }
};


// ============================================================
// RESULTADO DA BUSCA
// ============================================================

const renderSearchResult = (
    patient
) => {

    document.getElementById(
        "result-id"
    ).textContent =
        patient.patient_id ?? "";


    document.getElementById(
        "result-name"
    ).textContent =
        patient.name ?? "";


    document.getElementById(
        "result-birth-date"
    ).textContent =
        patient.birth_date ?? "";


    document.getElementById(
        "result-tax-id"
    ).textContent =
        patient.tax_id ?? "";


    document.getElementById(
        "result-phone"
    ).textContent =
        patient.phone ?? "";


    document.getElementById(
        "result-email"
    ).textContent =
        patient.email ?? "";


    const resultAddress =
        [
            patient.cep,
            patient.logradouro,
            patient.complemento,
            patient.bairro,
            patient.localidade,
            patient.uf
        ]
            .filter(Boolean)
            .join(", ");


    document.getElementById(
        "result-address"
    ).textContent =
        resultAddress;


    document.getElementById(
        "result-profession"
    ).textContent =
        patient.profession ?? "";


    document.getElementById(
        "result-appointments"
    ).textContent =
        patient.appointments?.length ?? 0;


    document
        .getElementById(
            "search-result"
        )
        .classList.remove(
            "d-none"
        );
};


// ============================================================
// LIMPAR BUSCA
// ============================================================

const clearSearch = () => {

    document.getElementById(
        "input-search-id"
    ).value = "";


    document.getElementById(
        "search-message"
    ).textContent = "";


    document.getElementById(
        "search-message"
    ).className = "mt-3";


    document
        .getElementById(
            "search-result"
        )
        .classList.add(
            "d-none"
        );
};


// ============================================================
// ADICIONAR PACIENTE
// ============================================================

const addPatient = async (
    patient
) => {

    setLoading(true);


    try {

        const query = `
            mutation addPatient(

                $name: String!
                $birth_date: String!
                $tax_id: String!
                $phone: String!
                $email: String!

                $cep: String!
                $logradouro: String!
                $complemento: String
                $bairro: String!
                $localidade: String!
                $uf: String!

                $profession: String!

            ) {

                addPatient(

                    name: $name
                    birth_date: $birth_date
                    tax_id: $tax_id
                    phone: $phone
                    email: $email

                    cep: $cep
                    logradouro: $logradouro
                    complemento: $complemento
                    bairro: $bairro
                    localidade: $localidade
                    uf: $uf

                    profession: $profession

                ) {

                    patient_id
                    name
                    email
                    birth_date

                    cep
                    logradouro
                    complemento
                    bairro
                    localidade
                    uf

                    profession

                }
            }
        `;


        const data =
            await graphqlRequest(
                query,
                patient
            );


        if (data.addPatient) {

            showMessageIn(
                document.getElementById(
                    "form-message"
                ),
                "Paciente adicionado com sucesso!",
                "success"
            );


            await getPatients();
        }


    } catch (error) {

        console.error(
            "Erro ao adicionar paciente:",
            error
        );


        showMessageIn(
            document.getElementById(
                "form-message"
            ),
            error.message,
            "danger"
        );


    } finally {

        setLoading(false);
    }
};


// ============================================================
// EXCLUIR PACIENTE
// ============================================================

const deletePatient = async (
    patientId
) => {

    const confirmDelete =
        confirm(
            "Tem certeza que deseja excluir este paciente?"
        );


    if (!confirmDelete) {
        return;
    }


    setLoading(true);


    try {

        const query = `
            mutation deletePatient(
                $patientId: ID!
            ) {

                deletePatient(
                    patientId: $patientId
                )

            }
        `;


        await graphqlRequest(
            query,
            {
                patientId:
                    patientId,
            }
        );


        await getPatients();


    } catch (error) {

        console.error(
            "Erro ao excluir paciente:",
            error
        );


        alert(
            error.message
        );


    } finally {

        setLoading(false);
    }
};


// ============================================================
// MODAL DE EDIÇÃO
// ============================================================

const openEditModal = (
    patient
) => {

    document.getElementById(
        "edit-patient-id"
    ).value =
        patient.patient_id ?? "";


    document.getElementById(
        "edit-name"
    ).value =
        patient.name ?? "";


    document.getElementById(
        "edit-birth-date"
    ).value =
        patient.birth_date ?? "";


    document.getElementById(
        "edit-tax-id"
    ).value =
        patient.tax_id ?? "";


    document.getElementById(
        "edit-phone"
    ).value =
        patient.phone ?? "";


    document.getElementById(
        "edit-email"
    ).value =
        patient.email ?? "";


    document.getElementById(
        "edit-cep"
    ).value =
        patient.cep ?? "";


    document.getElementById(
        "edit-logradouro"
    ).value =
        patient.logradouro ?? "";


    document.getElementById(
        "edit-complemento"
    ).value =
        patient.complemento ?? "";


    document.getElementById(
        "edit-bairro"
    ).value =
        patient.bairro ?? "";


    document.getElementById(
        "edit-localidade"
    ).value =
        patient.localidade ?? "";


    document.getElementById(
        "edit-uf"
    ).value =
        patient.uf ?? "";


    document.getElementById(
        "edit-profession"
    ).value =
        patient.profession ?? "";


    document.getElementById(
        "modal-edit-title"
    ).textContent =
        `Editar Paciente #${patient.patient_id}`;


    document.getElementById(
        "edit-message"
    ).textContent = "";


    document.getElementById(
        "edit-message"
    ).className = "mt-3";


    editModal.show();
};


// ============================================================
// EDITAR PACIENTE
// ============================================================

const saveEdit = async () => {

    const patientId =
        document.getElementById(
            "edit-patient-id"
        ).value;


    const editMessage =
        document.getElementById(
            "edit-message"
        );


    const saveButton =
        document.getElementById(
            "btn-save-edit"
        );


    const saveSpinner =
        document.getElementById(
            "btn-save-edit-spinner"
        );


    const patient = {

        name:
            document.getElementById(
                "edit-name"
            ).value || null,

        birth_date:
            document.getElementById(
                "edit-birth-date"
            ).value || null,

        tax_id:
            document.getElementById(
                "edit-tax-id"
            ).value || null,

        phone:
            document.getElementById(
                "edit-phone"
            ).value || null,

        email:
            document.getElementById(
                "edit-email"
            ).value || null,

        cep:
            document.getElementById(
                "edit-cep"
            ).value || null,

        logradouro:
            document.getElementById(
                "edit-logradouro"
            ).value || null,

        complemento:
            document.getElementById(
                "edit-complemento"
            ).value || null,

        bairro:
            document.getElementById(
                "edit-bairro"
            ).value || null,

        localidade:
            document.getElementById(
                "edit-localidade"
            ).value || null,

        uf:
            document.getElementById(
                "edit-uf"
            ).value || null,

        profession:
            document.getElementById(
                "edit-profession"
            ).value || null
    };


    saveButton.disabled = true;


    saveSpinner.classList.remove(
        "d-none"
    );


    try {

        const query = `
            mutation UpdatePatient(

                $patientId: ID!

                $name: String
                $birth_date: String

                $tax_id: String
                $phone: String
                $email: String

                $cep: String
                $logradouro: String
                $complemento: String
                $bairro: String
                $localidade: String
                $uf: String

                $profession: String

            ) {

                updatePatient(

                    patientId: $patientId

                    name: $name
                    birth_date: $birth_date

                    tax_id: $tax_id
                    phone: $phone
                    email: $email

                    cep: $cep
                    logradouro: $logradouro
                    complemento: $complemento
                    bairro: $bairro
                    localidade: $localidade
                    uf: $uf

                    profession: $profession

                ) {

                    patient_id
                    name
                    email
                    birth_date

                    cep
                    logradouro
                    complemento
                    bairro
                    localidade
                    uf

                    profession

                }
            }
        `;


        await graphqlRequest(
            query,
            {
                patientId:
                    patientId,

                ...patient
            }
        );


        showMessageIn(
            editMessage,
            "Paciente atualizado com sucesso!",
            "success"
        );


        editModal.hide();


        await getPatients();


    } catch (error) {

        console.error(
            "Erro ao atualizar paciente:",
            error
        );


        showMessageIn(
            editMessage,
            error.message,
            "danger"
        );


    } finally {

        saveButton.disabled = false;

        saveSpinner.classList.add(
            "d-none"
        );
    }
};


// ============================================================
// MODAL DE CONSULTAS
// ============================================================

const openAppointmentsModal = async (
    patient
) => {

    const patientId =
        patient.patient_id;


    document.getElementById(
        "appointment-patient-id"
    ).value =
        patientId;


    document.getElementById(
        "modal-appointments-title"
    ).textContent =
        `Consultas de ${patient.name}`;


    document.getElementById(
        "appointment-date"
    ).value = "";


    document.getElementById(
        "appointment-reason"
    ).value = "";


    document.getElementById(
        "appointment-notes"
    ).value = "";


    document.getElementById(
        "appointment-message"
    ).textContent = "";


    document.getElementById(
        "appointment-message"
    ).className = "mt-3";


    try {

        const query = `
            query GetPatientAppointments(
                $patientId: ID!
            ) {

                appointments(
                    patientId: $patientId
                ) {

                    appointment_id
                    patient_id
                    date
                    reason
                    notes

                }
            }
        `;


        const data =
            await graphqlRequest(
                query,
                {
                    patientId:
                        patientId
                }
            );


        renderAppointmentsList(
            data.appointments || []
        );


        appointmentsModal.show();


    } catch (error) {

        console.error(
            "Erro ao buscar consultas:",
            error
        );


        showMessageIn(
            document.getElementById(
                "appointment-message"
            ),
            error.message,
            "danger"
        );
    }
};


// ============================================================
// LISTA DE CONSULTAS
// ============================================================

const renderAppointmentsList = (
    appointments
) => {

    const container =
        document.getElementById(
            "appointments-list"
        );


    if (!appointments.length) {

        container.innerHTML = `
            <p class="text-muted mb-0">
                Nenhuma consulta cadastrada ainda.
            </p>
        `;

        return;
    }


    container.innerHTML = "";


    appointments.forEach(
        (appointment) => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "d-flex justify-content-between " +
                "align-items-start border rounded p-2 mb-2";


            const content =
                document.createElement(
                    "div"
                );


            const date =
                document.createElement(
                    "strong"
                );


            date.textContent =
                appointment.date || "";


            const reason =
                document.createTextNode(
                    ` — ${appointment.reason || ""}`
                );


            content.appendChild(
                date
            );


            content.appendChild(
                reason
            );


            if (appointment.notes) {

                const lineBreak =
                    document.createElement(
                        "br"
                    );


                const notes =
                    document.createElement(
                        "small"
                    );


                notes.className =
                    "text-muted";


                notes.textContent =
                    appointment.notes;


                content.appendChild(
                    lineBreak
                );


                content.appendChild(
                    notes
                );
            }


            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.type =
                "button";


            deleteButton.className =
                "btn btn-sm btn-outline-danger";


            deleteButton.textContent =
                "Excluir";


            deleteButton.addEventListener(
                "click",
                () => {

                    deleteAppointment(
                        appointment.appointment_id,
                        appointment.patient_id
                    );
                }
            );


            item.appendChild(
                content
            );


            item.appendChild(
                deleteButton
            );


            container.appendChild(
                item
            );
        }
    );
};


// ============================================================
// ADICIONAR CONSULTA
// ============================================================

const saveAppointment = async () => {

    const patientId =
        document.getElementById(
            "appointment-patient-id"
        ).value;


    const message =
        document.getElementById(
            "appointment-message"
        );


    const saveButton =
        document.getElementById(
            "btn-save-appointment"
        );


    const saveSpinner =
        document.getElementById(
            "btn-save-appointment-spinner"
        );


    const appointment = {

        patient_id:
            parseInt(
                patientId,
                10
            ),

        date:
            document.getElementById(
                "appointment-date"
            ).value,

        reason:
            document.getElementById(
                "appointment-reason"
            ).value,

        notes:
            document.getElementById(
                "appointment-notes"
            ).value || null,
    };


    if (
        !appointment.date ||
        !appointment.reason
    ) {

        showMessageIn(
            message,
            "Preencha data e motivo",
            "danger"
        );

        return;
    }


    saveButton.disabled = true;


    saveSpinner.classList.remove(
        "d-none"
    );


    try {

        const query = `
            mutation addAppointment(

                $patientId: ID!
                $date: String!
                $reason: String!
                $notes: String

            ) {

                addAppointment(

                    patient_id: $patientId
                    date: $date
                    reason: $reason
                    notes: $notes

                ) {

                    appointment_id
                    patient_id
                    date
                    reason
                    notes

                }
            }
        `;


        await graphqlRequest(
            query,
            {
                patientId:
                    appointment.patient_id,

                date:
                    appointment.date,

                reason:
                    appointment.reason,

                notes:
                    appointment.notes,
            }
        );


        showMessageIn(
            message,
            "Consulta adicionada com sucesso!",
            "success"
        );


        document.getElementById(
            "appointment-date"
        ).value = "";


        document.getElementById(
            "appointment-reason"
        ).value = "";


        document.getElementById(
            "appointment-notes"
        ).value = "";


        await reloadAppointments(
            patientId
        );


        await getPatients();


    } catch (error) {

        console.error(
            "Erro ao adicionar consulta:",
            error
        );


        showMessageIn(
            message,
            error.message,
            "danger"
        );


    } finally {

        saveButton.disabled = false;


        saveSpinner.classList.add(
            "d-none"
        );
    }
};


// ============================================================
// RECARREGAR CONSULTAS
// ============================================================

const reloadAppointments = async (
    patientId
) => {

    const query = `
        query GetPatientAppointments(
            $patientId: ID!
        ) {

            appointments(
                patientId: $patientId
            ) {

                appointment_id
                patient_id
                date
                reason
                notes

            }
        }
    `;


    const data =
        await graphqlRequest(
            query,
            {
                patientId:
                    patientId
            }
        );


    renderAppointmentsList(
        data.appointments || []
    );
};


// ============================================================
// EXCLUIR CONSULTA
// ============================================================

const deleteAppointment = async (
    appointmentId,
    patientId
) => {

    const confirmDelete =
        confirm(
            "Tem certeza que deseja excluir esta consulta?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const query = `
            mutation DeleteAppointment(
                $appointmentId: ID!
            ) {

                deleteAppointment(
                    appointmentId: $appointmentId
                )

            }
        `;


        await graphqlRequest(
            query,
            {
                appointmentId:
                    appointmentId,
            }
        );


        await reloadAppointments(
            patientId
        );


        await getPatients();


    } catch (error) {

        console.error(
            "Erro ao excluir consulta:",
            error
        );


        alert(
            error.message
        );
    }
};


// ============================================================
// CALENDÁRIO
// ============================================================

const loadCalendarAppointments = async () => {

    const loading =
        document.getElementById(
            "calendar-loading"
        );


    const content =
        document.getElementById(
            "calendar-content"
        );


    loading.classList.remove(
        "d-none"
    );


    content.classList.add(
        "opacity-50"
    );


    try {

        /*
         * Busca as consultas de todos os pacientes.
         */

        const requests =
            allPatients.map(
                async (patient) => {

                    const query = `
                        query GetPatientAppointments(
                            $patientId: ID!
                        ) {

                            appointments(
                                patientId: $patientId
                            ) {

                                appointment_id
                                patient_id
                                date
                                reason
                                notes

                            }
                        }
                    `;


                    const data =
                        await graphqlRequest(
                            query,
                            {
                                patientId:
                                    patient.patient_id
                            }
                        );


                    return (
                        data.appointments || []
                    ).map(
                        (appointment) => ({

                            ...appointment,

                            patient_name:
                                patient.name

                        })
                    );
                }
            );


        const results =
            await Promise.all(
                requests
            );


        allCalendarAppointments = [];


        results.forEach(
            (patientAppointments) => {

                allCalendarAppointments.push(
                    ...patientAppointments
                );
            }
        );


        renderCalendar();


    } catch (error) {

        console.error(
            "Erro ao carregar calendário:",
            error
        );


        const calendarDayDetails =
            document.getElementById(
                "calendar-day-details"
            );


        if (calendarDayDetails) {

            calendarDayDetails.innerHTML = `
                <div class="alert alert-danger">
                    Erro ao carregar as consultas:
                    ${escapeHtml(error.message)}
                </div>
            `;
        }


    } finally {

        loading.classList.add(
            "d-none"
        );


        content.classList.remove(
            "opacity-50"
        );
    }
};


// ============================================================
// SEGURANÇA PARA TEXTO HTML
// ============================================================

const escapeHtml = (
    value
) => {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
};


// ============================================================
// PARSE DE DATA
// ============================================================

const parseCalendarDate = (
    dateString
) => {

    if (!dateString) {
        return null;
    }


    const parts =
        String(dateString)
            .substring(0, 10)
            .split("-");


    if (parts.length !== 3) {
        return null;
    }


    const year =
        Number(parts[0]);


    const month =
        Number(parts[1]);


    const day =
        Number(parts[2]);


    if (
        !year ||
        !month ||
        !day
    ) {
        return null;
    }


    return {
        year,
        month,
        day
    };
};


// ============================================================
// CHAVE DA DATA
// ============================================================

const formatDateKey = (
    year,
    month,
    day
) => {

    return [
        String(year),

        String(month)
            .padStart(2, "0"),

        String(day)
            .padStart(2, "0")
    ].join("-");
};


// ============================================================
// FORMATAR DATA
// ============================================================

const formatCalendarDate = (
    dateKey
) => {

    const parsed =
        parseCalendarDate(
            dateKey
        );


    if (!parsed) {
        return dateKey;
    }


    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    ).format(
        new Date(
            Date.UTC(
                parsed.year,
                parsed.month - 1,
                parsed.day
            )
        )
    );
};


// ============================================================
// VERIFICAR SE É HOJE
// ============================================================

const isToday = (
    year,
    month,
    day
) => {

    const today =
        new Date();


    return (
        today.getFullYear() === year &&
        today.getMonth() === month &&
        today.getDate() === day
    );
};


// ============================================================
// RENDERIZAR CALENDÁRIO
// ============================================================

const renderCalendar = () => {

    const title =
        document.getElementById(
            "calendar-month-title"
        );


    const daysContainer =
        document.getElementById(
            "calendar-days"
        );


    if (
        !title ||
        !daysContainer
    ) {
        return;
    }


    const year =
        calendarDate.getFullYear();


    const month =
        calendarDate.getMonth();


    title.textContent =
        new Intl.DateTimeFormat(
            "pt-BR",
            {
                month: "long",
                year: "numeric"
            }
        ).format(
            calendarDate
        );


    daysContainer.innerHTML = "";


    /*
     * Primeiro dia do mês.
     *
     * 0 = domingo
     * 1 = segunda
     * ...
     */

    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    // Espaços antes do primeiro dia

    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "calendar-day empty";


        daysContainer.appendChild(
            empty
        );
    }


    // Dias do mês

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const dateKey =
            formatDateKey(
                year,
                month + 1,
                day
            );


        const dayAppointments =
            allCalendarAppointments.filter(
                (appointment) => {

                    const parsed =
                        parseCalendarDate(
                            appointment.date
                        );


                    if (!parsed) {
                        return false;
                    }


                    return (
                        parsed.year === year &&
                        parsed.month === month + 1 &&
                        parsed.day === day
                    );
                }
            );


        const dayElement =
            document.createElement(
                "div"
            );


        dayElement.className =
            "calendar-day";


        if (
            isToday(
                year,
                month,
                day
            )
        ) {

            dayElement.classList.add(
                "today"
            );
        }


        if (
            selectedCalendarDate ===
            dateKey
        ) {

            dayElement.classList.add(
                "selected"
            );
        }


        const dayNumber =
            document.createElement(
                "div"
            );


        dayNumber.className =
            "calendar-day-number";


        dayNumber.textContent =
            day;


        dayElement.appendChild(
            dayNumber
        );


        /*
         * Mostra até duas consultas
         * dentro do dia.
         */

        dayAppointments
            .slice(0, 2)
            .forEach(
                (appointment) => {

                    const appointmentElement =
                        document.createElement(
                            "div"
                        );


                    appointmentElement.className =
                        "calendar-appointment";


                    appointmentElement.textContent =
                        appointment.patient_name ||
                        "Consulta";


                    dayElement.appendChild(
                        appointmentElement
                    );
                }
            );


        if (
            dayAppointments.length > 2
        ) {

            const more =
                document.createElement(
                    "div"
                );


            more.className =
                "calendar-more";


            more.textContent =
                `+${dayAppointments.length - 2} consulta(s)`;


            dayElement.appendChild(
                more
            );
        }


        // ----------------------------------------------------
        // CLIQUE NO DIA
        // ----------------------------------------------------

        dayElement.addEventListener(
            "click",
            () => {

                selectedCalendarDate =
                    dateKey;


                renderCalendar();


                openCalendarDayModal(
                    dateKey
                );
            }
        );


        daysContainer.appendChild(
            dayElement
        );
    }
};


// ============================================================
// CRIAR MODAL DOS DETALHES DO DIA
// ============================================================

const createCalendarDayModal = () => {

    let modalElement =
        document.getElementById(
            "modal-calendar-day"
        );


    if (modalElement) {

        calendarDayModal =
            bootstrap.Modal.getOrCreateInstance(
                modalElement
            );

        return;
    }


    modalElement =
        document.createElement(
            "div"
        );


    modalElement.id =
        "modal-calendar-day";


    modalElement.className =
        "modal fade";


    modalElement.tabIndex =
        -1;


    modalElement.setAttribute(
        "aria-hidden",
        "true"
    );


    modalElement.innerHTML = `

        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">

            <div class="modal-content">

                <div class="modal-header">

                    <h5
                        class="modal-title"
                        id="modal-calendar-day-title"
                    >
                        Consultas do dia
                    </h5>

                    <button
                        type="button"
                        class="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Fechar"
                    ></button>

                </div>


                <div
                    class="modal-body"
                    id="modal-calendar-day-body"
                >
                </div>


                <div class="modal-footer">

                    <button
                        type="button"
                        class="btn btn-secondary"
                        data-bs-dismiss="modal"
                    >
                        Fechar
                    </button>

                </div>

            </div>

        </div>
    `;


    document.body.appendChild(
        modalElement
    );


    calendarDayModal =
        new bootstrap.Modal(
            modalElement
        );


    /*
     * Quando o modal do dia for fechado,
     * o calendário volta a aparecer.
     */

    modalElement.addEventListener(
        "hidden.bs.modal",
        () => {

            if (
                calendarModal &&
                !document.body.classList.contains(
                    "modal-open"
                )
            ) {

                calendarModal.show();
            }
        }
    );
};


// ============================================================
// ABRIR MODAL DO DIA
// ============================================================

const openCalendarDayModal = (
    dateKey
) => {

    createCalendarDayModal();


    const title =
        document.getElementById(
            "modal-calendar-day-title"
        );


    const body =
        document.getElementById(
            "modal-calendar-day-body"
        );


    if (
        !title ||
        !body
    ) {
        return;
    }


    const appointments =
        allCalendarAppointments.filter(
            (appointment) => {

                const parsed =
                    parseCalendarDate(
                        appointment.date
                    );


                if (!parsed) {
                    return false;
                }


                return (
                    formatDateKey(
                        parsed.year,
                        parsed.month,
                        parsed.day
                    ) === dateKey
                );
            }
        );


    title.textContent =
        `Consultas de ${formatCalendarDate(dateKey)}`;


    body.innerHTML = "";


    if (!appointments.length) {

        body.innerHTML = `
            <div class="alert alert-light border mb-0">

                <strong>
                    Nenhuma consulta neste dia.
                </strong>

            </div>
        `;


    } else {

        appointments.forEach(
            (appointment) => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "calendar-detail-card border rounded p-3 mb-3";


                const header =
                    document.createElement(
                        "div"
                    );


                header.className =
                    "d-flex justify-content-between align-items-start gap-3";


                const patientInfo =
                    document.createElement(
                        "div"
                    );


                const patientName =
                    document.createElement(
                        "strong"
                    );


                patientName.className =
                    "fs-5";


                patientName.textContent =
                    appointment.patient_name ||
                    "Paciente";


                const appointmentId =
                    document.createElement(
                        "div"
                    );


                appointmentId.className =
                    "text-muted small mt-1";


                appointmentId.textContent =
                    `Consulta #${appointment.appointment_id}`;


                patientInfo.appendChild(
                    patientName
                );


                patientInfo.appendChild(
                    appointmentId
                );


                const dateBadge =
                    document.createElement(
                        "span"
                    );


                dateBadge.className =
                    "badge bg-primary";


                dateBadge.textContent =
                    appointment.date || "";


                header.appendChild(
                    patientInfo
                );


                header.appendChild(
                    dateBadge
                );


                card.appendChild(
                    header
                );


                const reason =
                    document.createElement(
                        "div"
                    );


                reason.className =
                    "mt-3";


                const reasonStrong =
                    document.createElement(
                        "strong"
                    );


                reasonStrong.textContent =
                    "Motivo: ";


                reason.appendChild(
                    reasonStrong
                );


                reason.appendChild(
                    document.createTextNode(
                        appointment.reason ||
                        "Não informado"
                    )
                );


                card.appendChild(
                    reason
                );


                if (appointment.notes) {

                    const notes =
                        document.createElement(
                            "div"
                        );


                    notes.className =
                        "mt-2";


                    const notesStrong =
                        document.createElement(
                            "strong"
                        );


                    notesStrong.textContent =
                        "Observações: ";


                    notes.appendChild(
                        notesStrong
                    );


                    notes.appendChild(
                        document.createTextNode(
                            appointment.notes
                        )
                    );


                    card.appendChild(
                        notes
                    );
                }


                body.appendChild(
                    card
                );
            }
        );
    }


    /*
     * Fecha o modal principal do calendário
     * antes de abrir o modal novo.
     */

    if (
        calendarModal
    ) {

        calendarModal.hide();
    }


    /*
     * Pequeno atraso para o Bootstrap finalizar
     * o fechamento do primeiro modal antes de
     * abrir o segundo.
     */

    setTimeout(
        () => {

            calendarDayModal.show();

        },
        150
    );
};


// ============================================================
// ABRIR CALENDÁRIO
// ============================================================

const openCalendarModal = async () => {

    calendarDate =
        new Date();


    selectedCalendarDate =
        null;


    const calendarDayDetails =
        document.getElementById(
            "calendar-day-details"
        );


    /*
     * O antigo espaço de detalhes abaixo
     * do calendário não será mais utilizado.
     */

    if (calendarDayDetails) {

        calendarDayDetails.innerHTML = "";


        calendarDayDetails.classList.add(
            "d-none"
        );
    }


    calendarModal.show();


    await loadCalendarAppointments();
};


// ============================================================
// NAVEGAR ENTRE MESES
// ============================================================

const changeCalendarMonth = (
    amount
) => {

    calendarDate =
        new Date(
            calendarDate.getFullYear(),
            calendarDate.getMonth() + amount,
            1
        );


    selectedCalendarDate =
        null;


    renderCalendar();


    const calendarDayDetails =
        document.getElementById(
            "calendar-day-details"
        );


    if (calendarDayDetails) {

        calendarDayDetails.innerHTML = "";


        calendarDayDetails.classList.add(
            "d-none"
        );
    }
};


// ============================================================
// MENSAGENS
// ============================================================

const showMessageIn = (
    element,
    text,
    type
) => {

    if (!element) {
        return;
    }


    element.textContent =
        text;


    element.className =
        `mt-3 text-${type}`;


    setTimeout(
        () => {

            element.textContent =
                "";


            element.className =
                "mt-3";

        },
        3000
    );
};


// ============================================================
// BUSCAR ENDEREÇO PELO CEP
// ============================================================

const getAddressByCep = async (
    cep
) => {

    const query = `
        query AddressByCep(
            $cep: String!
        ) {

            addressByCep(
                cep: $cep
            ) {

                cep
                logradouro
                complemento
                bairro
                localidade
                uf

            }
        }
    `;


    const data =
        await graphqlRequest(
            query,
            {
                cep: cep
            }
        );


    return data.addressByCep;
};


// ============================================================
// PREENCHER ENDEREÇO PELO CEP
// ============================================================

const fillAddressByCep = async (
    cep,
    formPrefix
) => {

    if (!cep) {
        return;
    }


    try {

        const addressData =
            await getAddressByCep(
                cep
            );


        if (!addressData) {

            showMessageIn(
                document.getElementById(
                    formPrefix === "input"
                        ? "form-message"
                        : "edit-message"
                ),
                "CEP não encontrado.",
                "danger"
            );


            return;
        }


        document.getElementById(
            `${formPrefix}-cep`
        ).value =
            addressData.cep || "";


        document.getElementById(
            `${formPrefix}-logradouro`
        ).value =
            addressData.logradouro || "";


        document.getElementById(
            `${formPrefix}-complemento`
        ).value =
            addressData.complemento || "";


        document.getElementById(
            `${formPrefix}-bairro`
        ).value =
            addressData.bairro || "";


        document.getElementById(
            `${formPrefix}-localidade`
        ).value =
            addressData.localidade || "";


        document.getElementById(
            `${formPrefix}-uf`
        ).value =
            addressData.uf || "";


    } catch (error) {

        console.error(
            "Erro ao consultar CEP:",
            error
        );


        showMessageIn(
            document.getElementById(
                formPrefix === "input"
                    ? "form-message"
                    : "edit-message"
            ),
            "Erro ao consultar o CEP.",
            "danger"
        );
    }
};


// ============================================================
// FORMULÁRIO DE CADASTRO
// ============================================================

const handlePatientFormSubmit = async (
    event
) => {

    event.preventDefault();


    const patient = {

        name:
            document.getElementById(
                "input-name"
            ).value,

        birth_date:
            document.getElementById(
                "input-birth-date"
            ).value,

        tax_id:
            document.getElementById(
                "input-tax-id"
            ).value,

        phone:
            document.getElementById(
                "input-phone"
            ).value,

        email:
            document.getElementById(
                "input-email"
            ).value,

        cep:
            document.getElementById(
                "input-cep"
            ).value,

        logradouro:
            document.getElementById(
                "input-logradouro"
            ).value,

        complemento:
            document.getElementById(
                "input-complemento"
            ).value,

        bairro:
            document.getElementById(
                "input-bairro"
            ).value,

        localidade:
            document.getElementById(
                "input-localidade"
            ).value,

        uf:
            document.getElementById(
                "input-uf"
            ).value,

        profession:
            document.getElementById(
                "input-profession"
            ).value,
    };


    await addPatient(
        patient
    );


    event.target.reset();
};


// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // ----------------------------------------------------
        // MODAIS
        // ----------------------------------------------------

        const editModalElement =
            document.getElementById(
                "modal-edit"
            );


        const appointmentsModalElement =
            document.getElementById(
                "modal-appointments"
            );


        const calendarModalElement =
            document.getElementById(
                "modal-calendar"
            );


        if (editModalElement) {

            editModal =
                new bootstrap.Modal(
                    editModalElement
                );
        }


        if (appointmentsModalElement) {

            appointmentsModal =
                new bootstrap.Modal(
                    appointmentsModalElement
                );
        }


        if (calendarModalElement) {

            calendarModal =
                new bootstrap.Modal(
                    calendarModalElement
                );
        }


        /*
         * O modal do dia é criado dinamicamente
         * somente quando for necessário.
         */

        createCalendarDayModal();


        // ----------------------------------------------------
        // CEP - CADASTRO
        // ----------------------------------------------------

        const inputCep =
            document.getElementById(
                "input-cep"
            );


        if (inputCep) {

            inputCep.addEventListener(
                "blur",
                async (event) => {

                    const cep =
                        event.target.value.trim();


                    if (!cep) {
                        return;
                    }


                    await fillAddressByCep(
                        cep,
                        "input"
                    );
                }
            );
        }


        // ----------------------------------------------------
        // CEP - EDIÇÃO
        // ----------------------------------------------------

        const editCep =
            document.getElementById(
                "edit-cep"
            );


        if (editCep) {

            editCep.addEventListener(
                "blur",
                async (event) => {

                    const cep =
                        event.target.value.trim();


                    if (!cep) {
                        return;
                    }


                    await fillAddressByCep(
                        cep,
                        "edit"
                    );
                }
            );
        }


        // ----------------------------------------------------
        // FORMULÁRIO DE CADASTRO
        // ----------------------------------------------------

        const patientForm =
            document.getElementById(
                "form-patient"
            );


        if (patientForm) {

            patientForm.addEventListener(
                "submit",
                handlePatientFormSubmit
            );
        }


        // ----------------------------------------------------
        // SALVAR EDIÇÃO
        // ----------------------------------------------------

        const saveEditButton =
            document.getElementById(
                "btn-save-edit"
            );


        if (saveEditButton) {

            saveEditButton.addEventListener(
                "click",
                saveEdit
            );
        }


        // ----------------------------------------------------
        // SALVAR CONSULTA
        // ----------------------------------------------------

        const saveAppointmentButton =
            document.getElementById(
                "btn-save-appointment"
            );


        if (saveAppointmentButton) {

            saveAppointmentButton.addEventListener(
                "click",
                saveAppointment
            );
        }


        // ----------------------------------------------------
        // BUSCAR PACIENTE
        // ----------------------------------------------------

        const searchButton =
            document.getElementById(
                "btn-search"
            );


        if (searchButton) {

            searchButton.addEventListener(
                "click",
                searchPatientById
            );
        }


        // ----------------------------------------------------
        // LIMPAR BUSCA
        // ----------------------------------------------------

        const clearSearchButton =
            document.getElementById(
                "btn-clear-search"
            );


        if (clearSearchButton) {

            clearSearchButton.addEventListener(
                "click",
                clearSearch
            );
        }


        // ----------------------------------------------------
        // ATUALIZAR LISTAGEM
        // ----------------------------------------------------

        const refreshButton =
            document.getElementById(
                "btn-refresh"
            );


        if (refreshButton) {

            refreshButton.addEventListener(
                "click",
                getPatients
            );
        }


        // ----------------------------------------------------
        // FILTRO POR NOME
        // ----------------------------------------------------

        const filterInput =
            document.getElementById(
                "input-filter-name"
            );


        if (filterInput) {

            filterInput.addEventListener(
                "input",
                applyFilter
            );
        }


        // ----------------------------------------------------
        // CALENDÁRIO
        // ----------------------------------------------------

        const calendarButton =
            document.getElementById(
                "btn-calendar"
            );


        if (calendarButton) {

            calendarButton.addEventListener(
                "click",
                openCalendarModal
            );
        }


        const calendarPreviousButton =
            document.getElementById(
                "btn-calendar-prev"
            );


        if (calendarPreviousButton) {

            calendarPreviousButton.addEventListener(
                "click",
                () => {

                    changeCalendarMonth(
                        -1
                    );
                }
            );
        }


        const calendarNextButton =
            document.getElementById(
                "btn-calendar-next"
            );


        if (calendarNextButton) {

            calendarNextButton.addEventListener(
                "click",
                () => {

                    changeCalendarMonth(
                        1
                    );
                }
            );
        }


        // ----------------------------------------------------
        // BUSCA INICIAL
        // ----------------------------------------------------

        getPatients();

    }
);