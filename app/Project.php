<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = ['name', 'description'];

    public function scopeTaskUncompleted($query)
    {
        return $query->where('is_completed', false);
    }




    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
    public function uncompletedTasks()
    {
        return $this->hasMany(Task::class)->where('is_completed', false);
    }
}
