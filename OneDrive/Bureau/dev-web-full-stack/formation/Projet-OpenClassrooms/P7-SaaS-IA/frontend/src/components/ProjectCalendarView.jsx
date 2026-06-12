import styles from "@/app/projects/[id]/projectDetail.module.css";

export default function ProjectCalendarView({
  tachesCalendrier,
  utilisateurEstAssigne,
  getClasseStatut,
  traduireStatut,
}) {
  const tachesParDate = tachesCalendrier.reduce((acc, tache) => {
    const date = tache.dueDate
      ? new Date(tache.dueDate).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "Sans échéance";

    if (!acc[date]) {
      acc[date] = [];
    }

    acc[date].push(tache);

    return acc;
  }, {});

  function afficherTacheCalendrier(tache) {
    return (
      <div
        key={tache.id}
        className={`${styles.calendarTask} ${
          utilisateurEstAssigne(tache) ? styles.maTacheCalendrier : ""
        }`}
      >
        <div>
          <strong>{tache.title}</strong>
        </div>

        <span className={`${styles.badge} ${getClasseStatut(tache.status)}`}>
          {traduireStatut(tache.status)}
        </span>
      </div>
    );
  }

  if (tachesCalendrier.length === 0) {
    return <p>Aucune tâche à venir ne vous est assignée.</p>;
  }

  return Object.entries(tachesParDate).map(([date, tachesDate]) => (
    <div key={date} className={styles.calendarSection}>
      <h3 className={styles.calendarDate}>📅 {date}</h3>

      {tachesDate.map(afficherTacheCalendrier)}
    </div>
  ));
}
