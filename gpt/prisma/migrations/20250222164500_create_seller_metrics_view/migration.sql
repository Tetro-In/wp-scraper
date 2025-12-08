-- CreateView
create view "seller_metrics_view" as
select
  s.phone_number as seller_phone,
  s.name as seller_name,
  s.city,
  count(distinct ph.product_id) as total_listings_history,
  count(p.id) filter (where p.is_active) as current_active_listings,
  coalesce(
    round(
      100.0 *
      count(p.id) filter (
        where p.is_active
          and p.model_name is not null
          and p.storage_gb is not null
          and p.color is not null
      ) /
      nullif(count(p.id) filter (where p.is_active), 0)
    ),
    0
  ) as catalog_quality_score,
  (
    select avg(sl.products_found)
    from "scan_logs" sl
    where sl.seller_phone = s.phone_number
      and sl.scan_time >= now() - interval '30 days'
  ) as avg_listings_recent,
  (
    select max(sl.scan_time)
    from "scan_logs" sl
    where sl.seller_phone = s.phone_number
  ) as last_scan_date
from "sellers" s
left join "products" p on p.seller_phone = s.phone_number
left join "product_history" ph on ph.product_id = p.id
group by s.phone_number, s.name, s.city;


