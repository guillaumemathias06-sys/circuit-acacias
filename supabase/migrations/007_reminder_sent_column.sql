-- Évite l'envoi en double du rappel email si le cron tourne plus d'une fois sur la même fenêtre
alter table registrations add column reminder_sent boolean default false;
